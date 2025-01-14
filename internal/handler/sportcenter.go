package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/param"
)

type SportCenterHandler struct {
	service *service.SportCenterService
}

func NewSportCenterHandler(service *service.SportCenterService) *SportCenterHandler {
	return &SportCenterHandler{
		service: service,
	}
}

func (h *SportCenterHandler) GetAll(c *gin.Context) {
	result, err := h.service.GetAll()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *SportCenterHandler) GetOptions(c *gin.Context) {
	result, err := h.service.GetOptions()
	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *SportCenterHandler) Create(c *gin.Context) {
	dto := dto.SportCenterDto{}
	if err := c.BindJSON(&dto); err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	err := h.service.Create(
		dto.Name,
		dto.Location,
		dto.CostPerSection,
		dto.MinutePerSection,
	)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusBadRequest, err)
		return
	}

	c.Status(http.StatusOK)
}

func (h *SportCenterHandler) Update(c *gin.Context) {
	dto := dto.SportCenterDto{}
	id := param.FromRoute(c, "sportCenterId")

	if err := c.BindJSON(&dto); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	err := h.service.Update(
		id,
		dto.Name,
		dto.Location,
		dto.CostPerSection,
		dto.MinutePerSection,
	)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusOK)
}
