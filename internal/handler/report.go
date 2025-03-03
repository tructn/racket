package handler

import (
	"errors"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/util"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type (
	grouping struct {
		PlayerId        uint      `json:"playerId"`
		PlayerName      string    `json:"playerName"`
		PlayerTotalCost float64   `json:"playerTotalCost"`
		Matches         []details `json:"matches"`
	}

	details struct {
		Date             time.Time `json:"date"`
		MatchCost        float64   `json:"matchCost"`
		MatchPlayerCount uint      `json:"matchPlayerCount"`
		AdditionalCost   float64   `json:"matchAdditionalCost"`
		IndividualCost   float64   `json:"individualCost"`
	}

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

func (h *ReportHandler) GetUnpaidReport(c *gin.Context) {
	res, err := h.paymentservice.GetUnpaidConcatByPlayer()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ReportHandler) GetUnpaidReportV2(c *gin.Context) {
	res, err := h.paymentservice.GetUnpaidDetails()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h *ReportHandler) GetUnpaidReportForPublic(c *gin.Context) {
	shareCode := util.GetQueryString(c, "shareCode")

	var count int64
	if err := h.db.Model(&domain.ShareCode{}).Where("code = ?", shareCode).Count(&count).Error; err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if count == 0 {
		c.AbortWithError(http.StatusForbidden, errors.New("access denied"))
		return
	}

	res, err := h.paymentservice.GetUnpaidConcatByPlayer()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *ReportHandler) GetUnpaidDetailsByPlayer(c *gin.Context) {
	// TODO: find other solution for perf enhancement and temporary turn off sharecode check
	// shareCode := util.GetQueryString(c, "shareCode")

	// var count int64
	// if err := h.db.Model(&domain.ShareCode{}).Where("code = ?", shareCode).Count(&count).Error; err != nil {
	// 	c.AbortWithError(http.StatusBadRequest, err)
	// 	return
	// }

	// if count == 0 {
	// 	c.AbortWithError(http.StatusForbidden, errors.New("access denied"))
	// 	return
	// }

	// getting raw unpaid details with duplicated player rows
	data, err := h.paymentservice.GetUnpaidDetails()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	// group by player and calculate player attendant dates & costs
	groupedByPlayer := lo.GroupBy(data, func(item dto.MatchCostDetailsDto) string {
		return item.PlayerName
	})

	aggregation := lo.MapValues(groupedByPlayer, func(value []dto.MatchCostDetailsDto, key string) grouping {
		items := groupedByPlayer[key]
		matches := lo.Map(items, func(item dto.MatchCostDetailsDto, index int) details {
			matchCost := item.MatchCost + item.MatchAdditionalCost
			individualCost := matchCost / float64(item.MatchPlayerCount)

			return details{
				Date:             item.MatchDate,
				MatchCost:        matchCost,
				AdditionalCost:   item.MatchAdditionalCost,
				MatchPlayerCount: item.MatchPlayerCount,
				IndividualCost:   individualCost,
			}
		})

		return grouping{
			PlayerId:   items[0].PlayerId,
			PlayerName: key,
			Matches:    matches,
			PlayerTotalCost: lo.SumBy(matches, func(m details) float64 {
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
