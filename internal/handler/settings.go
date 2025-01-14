package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewSettingsHandler(db *gorm.DB, logger *zap.SugaredLogger) *SettingsHandler {
	return &SettingsHandler{
		db:     db,
		logger: logger,
	}
}

func (h *SettingsHandler) GetMessageTemplate(c *gin.Context) {
	var result string
	h.db.Model(&domain.Settings{}).Select("message_template").Scan(&result)
	c.JSON(http.StatusOK, result)
}

func (h *SettingsHandler) CreateMessageTemplate(c *gin.Context) {
	dto := dto.MessageTemplateDto{}
	var err error
	if err = c.BindJSON(&dto); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		h.logger.Error(err)
		return
	}

	settings := domain.Settings{}
	h.db.Model(&settings).FirstOrCreate(&domain.Settings{
		MessageTemplate: dto.Template,
	})

	settings.MessageTemplate = dto.Template
	h.db.Save(&settings)

	c.JSON(http.StatusOK, settings)
}
