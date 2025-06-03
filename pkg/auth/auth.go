package auth

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var (
	AUTH0_DOMAIN        string
	AUTH0_CLIENT_ID     string
	AUTH0_CLIENT_SECRET string
)

type Auth0User struct {
	UserID      string `json:"user_id"`
	Email       string `json:"email"`
	Name        string `json:"name"`
	Picture     string `json:"picture"`
	LastLogin   string `json:"last_login"`
	LoginsCount int    `json:"logins_count"`
}

func init() {
	godotenv.Load(".env")

	AUTH0_DOMAIN = os.Getenv("AUTH0_DOMAIN")
	AUTH0_CLIENT_ID = os.Getenv("AUTH0_CLIENT_ID")
	AUTH0_CLIENT_SECRET = os.Getenv("AUTH0_CLIENT_SECRET")

	if AUTH0_DOMAIN == "" {
		panic("AUTH0_DOMAIN is not set")
	}

	if AUTH0_CLIENT_ID == "" {
		panic("AUTH0_CLIENT_ID is not set")
	}

	if AUTH0_CLIENT_SECRET == "" {
		panic("AUTH0_CLIENT_SECRET is not set")
	}
}

func GetAuth0Users() ([]Auth0User, error) {
	token, err := getToken(AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET)

	if err != nil {
		log.Printf("error getting token: %v", err)
		return nil, err
	}

	users, err := getUsers(AUTH0_DOMAIN, token)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func getToken(domain, clientId, clientSecret string) (string, error) {
	url := fmt.Sprintf("https://%s/oauth/token", domain)

	payload := strings.NewReader(fmt.Sprintf(`{
		"client_id": "%s",
		"client_secret": "%s",
		"audience": "https://%s/api/v2/",
		"grant_type": "client_credentials"
	}`, clientId, clientSecret, domain))

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("content-type", "application/json")

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return "", fmt.Errorf("failed to get access token: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	var tokenResponse struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
	}

	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	if tokenResponse.AccessToken == "" {
		return "", fmt.Errorf("no access token in response")
	}

	return tokenResponse.AccessToken, nil
}

func getUsers(domain, token string) ([]Auth0User, error) {
	url := fmt.Sprintf("https://%s/api/v2/users", domain)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create users request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read users response: %w", err)
	}

	// Log response for debugging
	log.Printf("Auth0 users response: %s", string(body))

	var users []Auth0User
	if err := json.Unmarshal(body, &users); err != nil {
		return nil, fmt.Errorf("failed to parse users response: %w", err)
	}

	return users, nil
}
