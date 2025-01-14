package service

import (
	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type MatchService struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewMatchService(db *gorm.DB, logger *zap.SugaredLogger) *MatchService {
	return &MatchService{
		db:     db,
		logger: logger,
	}
}

func (s *MatchService) GetMatchSummary(matchId uint) (*dto.MatchSummaryDto, error) {
	match := &domain.Match{}
	err := s.db.Model(&domain.Match{}).
		Preload("SportCenter").
		Find(&match, matchId).
		Error

	if err != nil {
		return nil, err
	}

	return &dto.MatchSummaryDto{
		MatchId:         match.ID,
		Start:           match.Start,
		End:             match.End,
		SportCenterName: match.SportCenter.Name,
	}, nil
}

func (s *MatchService) GetTodayMatches() []dto.MatchDto {
	var matches []domain.Match
	s.db.
		Preload("SportCenter", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, cost_per_section, minute_per_section")
		}).
		Preload("AdditionalCosts", func(db *gorm.DB) *gorm.DB {
			return db.Select("amount, match_id")
		}).
		Where("start::date = CURRENT_DATE::date").
		Order("start DESC").
		Find(&matches)

	// Optionally, parallelize the mapping if necessary
	result := lo.Map(matches, func(m domain.Match, _ int) dto.MatchDto {
		// Calculate AdditionalCost
		additionalCost := lo.SumBy(m.AdditionalCosts, func(ac domain.AdditionalCost) float64 {
			return ac.Amount
		})

		return dto.MatchDto{
			MatchId:          m.ID,
			Start:            m.Start,
			End:              m.End,
			SportCenterId:    m.SportCenterId,
			SportCenterName:  m.SportCenter.Name,
			CostPerSection:   m.SportCenter.CostPerSection,
			MinutePerSection: m.SportCenter.MinutePerSection,
			Cost:             m.Cost,
			AdditionalCost:   additionalCost,
			Court:            m.Court,
			CustomSection:    m.CustomSection,
		}
	})

	return result
}

func (s *MatchService) GetFutureMatches() []dto.MatchDto {
	var matches []domain.Match
	s.db.
		Preload("SportCenter", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, cost_per_section, minute_per_section")
		}).
		Preload("AdditionalCosts", func(db *gorm.DB) *gorm.DB {
			return db.Select("amount, match_id")
		}).
		Where("start::date > CURRENT_DATE::date").
		Order("start DESC").
		Find(&matches)

	// Optionally, parallelize the mapping if necessary
	result := lo.Map(matches, func(m domain.Match, _ int) dto.MatchDto {
		// Calculate AdditionalCost
		additionalCost := lo.SumBy(m.AdditionalCosts, func(ac domain.AdditionalCost) float64 {
			return ac.Amount
		})

		return dto.MatchDto{
			MatchId:          m.ID,
			Start:            m.Start,
			End:              m.End,
			SportCenterId:    m.SportCenterId,
			SportCenterName:  m.SportCenter.Name,
			CostPerSection:   m.SportCenter.CostPerSection,
			MinutePerSection: m.SportCenter.MinutePerSection,
			Cost:             m.Cost,
			AdditionalCost:   additionalCost,
			Court:            m.Court,
			CustomSection:    m.CustomSection,
		}
	})

	return result
}

func (s *MatchService) GetArchivedMatches() []dto.MatchDto {
	var matches []domain.Match
	s.db.
		Preload("SportCenter", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, cost_per_section, minute_per_section")
		}).
		Preload("AdditionalCosts", func(db *gorm.DB) *gorm.DB {
			return db.Select("amount, match_id")
		}).
		Where("start < CURRENT_DATE").
		Order("start DESC").
		Find(&matches)

	// Optionally, parallelize the mapping if necessary
	result := lo.Map(matches, func(m domain.Match, _ int) dto.MatchDto {
		// Calculate AdditionalCost
		additionalCost := lo.SumBy(m.AdditionalCosts, func(ac domain.AdditionalCost) float64 {
			return ac.Amount
		})

		return dto.MatchDto{
			MatchId:          m.ID,
			Start:            m.Start,
			End:              m.End,
			SportCenterId:    m.SportCenterId,
			SportCenterName:  m.SportCenter.Name,
			CostPerSection:   m.SportCenter.CostPerSection,
			MinutePerSection: m.SportCenter.MinutePerSection,
			Cost:             m.Cost,
			AdditionalCost:   additionalCost,
			Court:            m.Court,
			CustomSection:    m.CustomSection,
		}
	})

	return result
}
