package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/auth0"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserHandler struct {
	logger      *zap.SugaredLogger
	userService *service.UserService
	db          *gorm.DB
}

func NewUserHandler(
	logger *zap.SugaredLogger,
	userService *service.UserService,
	db *gorm.DB,
) *UserHandler {
	return &UserHandler{
		logger:      logger,
		userService: userService,
		db:          db,
	}
}

func (h *UserHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/users/auth0")
	{
		group.GET("", h.getAuth0Users)
		group.POST("/sync", h.syncAuth0UsersDbUser)
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
	if err := h.userService.SyncPlayersFromAuth0Users(users); err != nil {
		c.JSON(500, gin.H{"error": "Failed to sync users"})
		return
	}
	c.JSON(200, gin.H{"message": "Users synced successfully"})
}
