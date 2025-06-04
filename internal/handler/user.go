package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/auth0"
	"go.uber.org/zap"
)

type UserHandler struct {
	logger      *zap.SugaredLogger
	userService *service.UserService
}

func NewUserHandler(
	logger *zap.SugaredLogger,
	userService *service.UserService,
) *UserHandler {
	return &UserHandler{
		logger:      logger,
		userService: userService,
	}
}

func (h *UserHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/users/auth0")
	{
		group.GET("", h.getAuth0Users)
		group.POST("/sync", h.syncAuth0UsersDbUser)
		group.POST("/hook", h.syncAuth0UsersHook)
	}
}

func (h *UserHandler) getAuth0Users(c *gin.Context) {
	users, err := auth0.GetAuth0Users()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get users"})
		return
	}
	c.JSON(200, users)
}

func (h *UserHandler) syncAuth0UsersDbUser(c *gin.Context) {
	users, err := auth0.GetAuth0Users()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get users"})
		return
	}
	if err := h.userService.SyncUsersFromAuth0Users(users); err != nil {
		c.JSON(500, gin.H{"error": "Failed to sync users"})
		return
	}
	c.JSON(200, gin.H{"message": "Users synced successfully"})
}

func (h *UserHandler) syncAuth0UsersHook(c *gin.Context) {
	var req struct {
		UserID        string `json:"user_id"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		FirstName     string `json:"given_name"`
		LastName      string `json:"family_name"`
		Picture       string `json:"picture"`
		CreatedAt     string `json:"created_at"`
		UpdatedAt     string `json:"updated_at"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	user, err := h.userService.CreateUser(dto.CreateUserDto{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Picture:   req.Picture,
		IdpUserID: req.UserID,
	})

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(200, gin.H{"message": "User created successfully", "user": user})
}
