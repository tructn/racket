package currentuser

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/domain"
	"gorm.io/gorm"
)

func GetIdpUser(c *gin.Context) (map[string]interface{}, error) {
	user, exists := c.Get("idp_user")

	if !exists {
		return nil, fmt.Errorf("user not found in context")
	}
	return user.(map[string]interface{}), nil
}

func GetIdpUserId(c *gin.Context) (string, error) {
	idpUserId, exists := c.Get("idp_user_id")

	if !exists {
		return "", fmt.Errorf("user not found in context")
	}

	userId, ok := idpUserId.(string)
	if !ok {
		return "", fmt.Errorf("invalid user ID in claims")
	}

	return userId, nil
}

func GetIdpUserRoles(c *gin.Context) ([]string, error) {
	user, exists := c.Get("idp_user_roles")
	if !exists {
		return []string{}, fmt.Errorf("user not found in context")
	}

	roles, ok := user.(map[string]interface{})["https://auth.tn.co.uk/roles"].([]string)
	if !ok {
		return []string{}, fmt.Errorf("invalid user roles in claims")
	}

	return roles, nil
}

func GetPlayerId(c *gin.Context, db *gorm.DB) (uint, error) {
	idpUserId, err := GetIdpUserId(c)
	if err != nil {
		return 0, err
	}

	var playerId uint
	if err := db.Model(&domain.Player{}).Where("external_user_id = ?", idpUserId).Select("id").First(&playerId).Error; err != nil {
		return 0, err
	}

	return playerId, nil
}
