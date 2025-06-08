package handler

import (
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"gorm.io/gorm"
)

type (
	player struct {
		PlayerId        uint    `json:"playerId"`
		PlayerName      string  `json:"playerName"`
		PlayerEmail     string  `json:"playerEmail"`
		PlayerTotalCost float64 `json:"playerTotalCost"`
		Matches         []match `json:"matches"`
	}

	match struct {
		Date               time.Time `json:"date"`
		MatchCost          float64   `json:"matchCost"`
		MatchPlayerCount   uint      `json:"matchPlayerCount"`
		AdditionalCost     float64   `json:"matchAdditionalCost"`
		IndividualCost     float64   `json:"individualCost"`
		TotalPlayerPaidFor uint      `json:"totalPlayerPaidFor"`
	}
)

type AnonymousHandler struct {
	db             *gorm.DB
	paymentservice *service.PaymentService
}

func NewAnonymousHandler(db *gorm.DB, paymentservice *service.PaymentService) *AnonymousHandler {
	return &AnonymousHandler{db: db, paymentservice: paymentservice}
}

func (h *AnonymousHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/anonymous")
	{
		group.POST("/webhooks/auth0", h.syncUserWebHook)
		group.GET("/reports/outstanding-payments", h.getOutstandingPaymentReport)
	}
}

func (h *AnonymousHandler) getOutstandingPaymentReport(c *gin.Context) {
	//TODO: share code verification
	data, err := h.paymentservice.GetOutstandingPaymentReportForAnonymous()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	groupedByPlayer := lo.GroupBy(data, func(item dto.AnonymousOutstandingPaymentReportDto) string {
		return strconv.Itoa(int(item.PlayerId))
	})

	aggregation := lo.MapValues(groupedByPlayer, func(value []dto.AnonymousOutstandingPaymentReportDto, key string) player {
		items := groupedByPlayer[key]
		matches := lo.Map(items, func(item dto.AnonymousOutstandingPaymentReportDto, index int) match {
			matchCost := item.MatchCost + item.MatchAdditionalCost
			individualCost := float64(item.TotalPlayerPaidFor) * (matchCost / float64(item.MatchPlayerCount))

			return match{
				Date:               item.MatchDate,
				MatchCost:          matchCost,
				TotalPlayerPaidFor: item.TotalPlayerPaidFor,
				AdditionalCost:     item.MatchAdditionalCost,
				MatchPlayerCount:   item.MatchPlayerCount,
				IndividualCost:     individualCost,
			}
		})

		return player{
			PlayerId:    items[0].PlayerId,
			PlayerName:  items[0].PlayerName,
			PlayerEmail: maskEmail(items[0].PlayerEmail),
			Matches:     matches,
			PlayerTotalCost: lo.SumBy(matches, func(m match) float64 {
				return m.IndividualCost
			}),
		}
	})

	result := lo.Values(aggregation)

	sort.Slice(result, func(i, j int) bool {
		return result[i].PlayerName < result[j].PlayerName
	})

	c.JSON(http.StatusOK, result)
}

func (h *AnonymousHandler) syncUserWebHook(c *gin.Context) {
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

	err := h.db.Transaction(func(tx *gorm.DB) error {
		player := domain.NewPlayer(req.UserID, req.Email, req.FirstName, req.LastName)
		if err := tx.Create(player).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user and player"})
		return
	}

	c.JSON(200, gin.H{"message": "User and player created successfully"})
}

func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return email
	}

	username := parts[0]
	domain := parts[1]

	// If username is 2 or fewer characters, just return the original
	if len(username) <= 2 {
		return email
	}

	// Keep first 2 characters and last character of username
	maskedUsername := username[:2] + strings.Repeat("*", len(username)-3) + username[len(username)-1:]
	return maskedUsername + "@" + domain
}
