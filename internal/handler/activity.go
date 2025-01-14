package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/service"
)

type ActivityHandler struct {
	activitysvc *service.ActivityService
}

func NewActivityHandler(activitysvc *service.ActivityService) *ActivityHandler {
	return &ActivityHandler{
		activitysvc: activitysvc,
	}
}

func (h *ActivityHandler) GetAll(c *gin.Context) {
	res := h.activitysvc.GetAll()
	c.JSON(http.StatusOK, res)
}
