package auth0

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

type AuthUser struct {
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

func GetUsers() ([]AuthUser, error) {

	log.Printf("Domain: %s", AUTH0_DOMAIN)
	log.Printf("Client ID: %s", AUTH0_CLIENT_ID)
	log.Printf("Client Secret: %s", AUTH0_CLIENT_SECRET)

	token, err := getAuth0AccessToken(AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET)

	if err != nil {
		return nil, err
	}

	users, err := getAuth0Users(AUTH0_DOMAIN, token)

	if err != nil {
		log.Printf("Error getting users: %v", err)
		return nil, err
	}

	log.Printf("Users: %v", users)

	return users, nil
}

func getAuth0AccessToken(domain, clientId, clientSecret string) (string, error) {
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

	var tokenModel struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
	}

	if err := json.Unmarshal(body, &tokenModel); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	if tokenModel.AccessToken == "" {
		return "", fmt.Errorf("no access token in response")
	}

	return tokenModel.AccessToken, nil
}

func getAuth0Users(domain, token string) ([]AuthUser, error) {
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
		log.Printf("Error: %v", err)
		return nil, fmt.Errorf("failed to get users: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read users response: %w", err)
	}

	var users []AuthUser
	if err := json.Unmarshal(body, &users); err != nil {
		return nil, fmt.Errorf("failed to parse users response: %w", err)
	}

	return users, nil
}
