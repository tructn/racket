package currentuser

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func GetUserId(c *gin.Context) (string, error) {
	user, exists := c.Get("user")
	if !exists {
		return "", fmt.Errorf("user not found in context")
	}

	userId, ok := user.(map[string]interface{})["sub"].(string)
	if !ok {
		return "", fmt.Errorf("invalid user ID in claims")
	}

	return userId, nil
}

func GetUserRoles(c *gin.Context) ([]string, error) {
	user, exists := c.Get("user")
	if !exists {
		return []string{}, fmt.Errorf("user not found in context")
	}

	roles, ok := user.(map[string]interface{})["https://auth.tn.co.uk/roles"].([]string)
	if !ok {
		return []string{}, fmt.Errorf("invalid user roles in claims")
	}

	return roles, nil
}
