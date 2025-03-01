package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/pkg/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ShareCodeHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewShareCodeHandler(db *gorm.DB, logger *zap.SugaredLogger) *ShareCodeHandler {
	return &ShareCodeHandler{
		db:     db,
		logger: logger,
	}
}

func (h *ShareCodeHandler) CreateShareUrl(c *gin.Context) {
	dto := dto.CreateShareUrlDto{}
	var err error
	if err = c.BindJSON(&dto); err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	sc := domain.NewShareCodeWithUrl(dto.Url, &domain.DefaultGenerator{})

	if err := h.db.Create(sc).Error; err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, sc)
}

func (h *ShareCodeHandler) GetShareUrls(c *gin.Context) {
	shareUrls := []dto.ShareCodeDto{}
	if err := h.db.Model(&domain.ShareCode{}).Select("Id", "FullUrl").Scan(&shareUrls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, shareUrls)
}

func (h *ShareCodeHandler) DeleteShareCodeUrl(c *gin.Context) {
	id := util.GetRouteString(c, "shareCodeId")
	if err := h.db.Unscoped().Delete(&domain.ShareCode{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, "Delete success")
}
