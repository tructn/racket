package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/pkg/param"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type PlayerHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewPlayerHandler(db *gorm.DB, logger *zap.SugaredLogger) *PlayerHandler {
	return &PlayerHandler{
		db:     db,
		logger: logger,
	}
}

func (h *PlayerHandler) Create(c *gin.Context) {
	dto := dto.PlayerSummaryDto{}
	var err error
	if err = c.BindJSON(&dto); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	p := &domain.Player{
		FirstName: dto.FirstName,
		LastName:  dto.LastName,
	}
	h.db.Create(p)
	c.JSON(http.StatusCreated, p)
}

func (h *PlayerHandler) GetAll(c *gin.Context) {
	var result []domain.Player
	h.db.Order("first_name ASC").Find(&result)
	c.JSON(http.StatusOK, result)
}

func (h *PlayerHandler) GetExternalUserAttendantRequests(c *gin.Context) {
	var result []dto.PlayerAttendantRequestDto
	externalUserId := param.FromRoute(c, "externalUserId")
	h.db.Raw(`
	SELECT m.id as match_id, pl.id as player_id
	FROM matches m
	JOIN registrations re ON m.id = re.match_id
	JOIN players pl ON pl.id = re.player_id
	WHERE pl.external_user_id = ?
	`, externalUserId).Scan(&result)

	h.logger.Info(result)

	c.JSON(http.StatusOK, result)
}

func (h *PlayerHandler) Update(c *gin.Context) {
	var model dto.PlayerSummaryDto
	id := param.FromRoute(c, "playerId")
	if err := c.BindJSON(&model); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}
	p := domain.Player{}
	h.db.Find(&p, id)

	p.FirstName = model.FirstName
	p.LastName = model.LastName
	h.db.Save(&p)
	c.JSON(http.StatusOK, p)
}

func (h *PlayerHandler) Delete(c *gin.Context) {
	id := param.FromRoute(c, "playerId")

	if err := h.db.Unscoped().Where("player_id = ?", id).Delete(&domain.Registration{}).Error; err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Error())
		return
	}

	if err := h.db.Unscoped().Delete(&domain.Player{}, id).Error; err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err.Error())
		return
	}
	c.Status(http.StatusOK)
}

func (h *PlayerHandler) MarkOutstandingPaymentsAsPaid(c *gin.Context) {
	playerId := param.FromRoute(c, "playerId")
	if err := h.db.
		Model(&domain.Registration{}).
		Where("player_id = ? AND is_paid = false", playerId).
		Updates(map[string]interface{}{
			"is_paid": true,
		}).Error; err != nil {

		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	c.Status(http.StatusOK)
}

func (h *PlayerHandler) OpenAccount(c *gin.Context) {
	playerId := param.FromRouteUInt(c, "playerId")

	var count int64
	if err := h.db.
		Model(&domain.Account{}).
		Where("player_id = ?", playerId).
		Count(&count).Error; err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	if count > 0 {
		c.AbortWithError(http.StatusBadRequest, errors.New("player already has an active account"))
		return
	}

	acc := domain.NewAccount(playerId)
	if err := h.db.Create(acc).Error; err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, acc.ID)
}
