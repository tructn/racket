package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/service"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type (
	ReportHandler struct {
		paymentservice *service.PaymentService
		db             *gorm.DB
		logger         *zap.SugaredLogger
	}
)

func NewReportHandler(paymentservice *service.PaymentService, db *gorm.DB, logger *zap.SugaredLogger) *ReportHandler {
	return &ReportHandler{
		paymentservice: paymentservice,
		db:             db,
		logger:         logger,
	}
}

func (h *ReportHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/reports")
	{
		group.GET("/outstanding-payments", h.getOutstandingPayments)
	}
}

func (h *ReportHandler) getOutstandingPayments(c *gin.Context) {
	res, err := h.paymentservice.GetPlayerUnpaidReport()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, res)
}
