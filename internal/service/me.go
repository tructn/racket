package service

import (
	"errors"

	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/pkg/result"
	"gorm.io/gorm"
)

type MeService struct {
	db *gorm.DB
}

func NewMeService(db *gorm.DB) *MeService {
	return &MeService{db: db}
}

func (s *MeService) GetMyWallet(playerId uint) (*dto.WalletDto, error) {
	var wallet domain.Wallet
	err := s.db.Where("owner_id = ?", playerId).First(&wallet).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, result.ErrorNotFound
	}

	if err != nil {
		return nil, err
	}

	return &dto.WalletDto{
		Id:      wallet.ID,
		Balance: wallet.Balance,
	}, nil
}

func (s *MeService) GetMyUpcommingMatches(playerId uint) ([]dto.MatchDto, error) {
	var matches []domain.Match
	s.db.
		Preload("SportCenter").
		Preload("AdditionalCosts").
		Preload("Registrations").
		Where("start::date >= CURRENT_DATE::date").
		Order("start ASC").
		Find(&matches)

	result := lo.Map(matches, func(m domain.Match, _ int) dto.MatchDto {
		isRegistered := lo.ContainsBy(m.Registrations, func(reg domain.Registration) bool {
			return reg.PlayerId == playerId
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
			AdditionalCost:   m.CalcAdditionalCost(),
			Court:            m.Court,
			PlayerCount:      m.CalcPlayerCount(),
			RegistrationIds:  lo.Map(m.Registrations, func(reg domain.Registration, _ int) uint { return reg.ID }),
			IndividualCost:   m.CalcIndividualCost(),
			IsRegistered:     isRegistered,
		}
	})

	return result, nil
}
