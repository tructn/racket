package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/pkg/auth0"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UserHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewUserHandler(db *gorm.DB, logger *zap.SugaredLogger) *UserHandler {
	return &UserHandler{
		db:     db,
		logger: logger,
	}
}

func (h *UserHandler) UseRouter(router *gin.RouterGroup) {
	users := router.Group("/users/auth0")
	{
		users.GET("", h.getAuth0Users)
	}
}

func (h *UserHandler) getAuth0Users(c *gin.Context) {
	users, err := auth0.GetUsers()
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get users"})
		return
	}
	c.JSON(200, users)
}
