package auth0

import (
	"encoding/json"
	"fmt"
	"io"
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
	MaskedEmail string `json:"masked_email"`
	Name        string `json:"name"`
	GivenName   string `json:"given_name"`
	FamilyName  string `json:"family_name"`
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

	token, err := getAuth0AccessToken(AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET)

	if err != nil {
		return nil, err
	}

	users, err := getAuth0Users(AUTH0_DOMAIN, token)

	if err != nil {
		return nil, err
	}

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

func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}

	username := parts[0]
	domain := parts[1]

	// If username is 2 or fewer characters, just show first character
	if len(username) <= 2 {
		return username[:1] + "***@" + domain
	}

	// Show first 2 characters and last character of username
	maskedUsername := username[:2] + "***" + username[len(username)-1:]
	return maskedUsername + "@" + domain
}

func getAuth0Users(domain, token string) ([]Auth0User, error) {
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

	var users []Auth0User
	if err := json.Unmarshal(body, &users); err != nil {
		return nil, fmt.Errorf("failed to parse users response: %w", err)
	}

	// Add masked email for each user
	for i := range users {
		users[i].MaskedEmail = maskEmail(users[i].Email)
	}

	return users, nil
}
