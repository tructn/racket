package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/currentuser"
	"gorm.io/gorm"
)

type MeHandler struct {
	db        *gorm.DB
	meService *service.MeService
}

func NewMeHandler(db *gorm.DB, meService *service.MeService) *MeHandler {
	return &MeHandler{db: db, meService: meService}
}

func (h *MeHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/me")
	{
		group.GET("/profile", h.getProfile)
		group.GET("/upcoming-matches", h.getMyUpcomingMatches)
	}
}

func (h *MeHandler) getProfile(c *gin.Context) {
	user, err := currentuser.GetIdpUser(c)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	log.Printf("user: %v", user)

	c.JSON(http.StatusOK, user)
}

func (h *MeHandler) getMyUpcomingMatches(c *gin.Context) {
	playerId, err := currentuser.GetPlayerId(c, h.db)

	log.Printf("playerId: %v", playerId)

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	matches, err := h.meService.GetMyUpcommingMatches(playerId)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, matches)
}
