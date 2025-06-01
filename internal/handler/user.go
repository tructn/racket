package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/service"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

type GetCurrentUserResponse struct {
	ID        uint   `json:"id"`
	IdpUserId string `json:"idpUserId"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Picture   string `json:"picture"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type UpdateProfileRequest struct {
	Name    string `json:"name" binding:"required"`
	Picture string `json:"picture"`
}

// GetCurrentUser handles GET /api/users/me
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	// Get user info from context (set by auth middleware)
	userInfo := c.MustGet("user").(map[string]interface{})
	idpUserId := userInfo["sub"].(string)
	email := userInfo["email"].(string)
	name := userInfo["name"].(string)
	picture := userInfo["picture"].(string)

	// Get or create user
	user, err := h.userService.GetOrCreateUser(idpUserId, email, name, picture)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to get/create user"})
		return
	}

	// Return user info
	response := GetCurrentUserResponse{
		ID:        user.ID,
		IdpUserId: user.IdpUserId,
		Email:     user.Email,
		Name:      user.Name,
		Picture:   user.Picture,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}

// UpdateProfile handles PUT /api/users/me
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Get user info from context
	userInfo := c.MustGet("user").(map[string]interface{})
	idpUserId := userInfo["sub"].(string)

	// Update user profile
	user, err := h.userService.UpdateProfile(idpUserId, req.Name, req.Picture)
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Return updated user info
	response := GetCurrentUserResponse{
		ID:        user.ID,
		IdpUserId: user.IdpUserId,
		Email:     user.Email,
		Name:      user.Name,
		Picture:   user.Picture,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}
