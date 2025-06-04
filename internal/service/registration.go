package service

import (
	"fmt"

	"github.com/tructn/racket/internal/domain"
	"gorm.io/gorm"
)

type RegistrationService struct {
	db *gorm.DB
}

func NewRegistrationService(db *gorm.DB) *RegistrationService {
	return &RegistrationService{db: db}
}

func (s *RegistrationService) RegisterMatch(playerId uint, matchId uint) error {
	var isExist bool
	if err := s.db.Model(&domain.Registration{}).
		Where("player_id = ? AND match_id = ?", playerId, matchId).
		Select("COUNT(1) > 0").
		Scan(&isExist).Error; err != nil {
		return err
	}
	if isExist {
		return fmt.Errorf("player already registered for this match")
	}

	registration := domain.NewRegistration(playerId, matchId)
	if err := s.db.Create(registration).Error; err != nil {
		return err
	}

	return nil
}

func (s *RegistrationService) UnregisterMatch(playerId uint, matchId uint) error {
	result := s.db.Where("player_id = ? AND match_id = ?", playerId, matchId).
		Delete(&domain.Registration{})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("no registration found for this match")
	}

	return nil
}
