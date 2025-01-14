package service

import (
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"gorm.io/gorm"
)

type PlayerService struct {
	db *gorm.DB
}

func NewPlayerService(db *gorm.DB) *PlayerService {
	return &PlayerService{
		db: db,
	}
}

func (s *PlayerService) GetPlayerSummary(playerId uint) (*dto.PlayerSummaryDto, error) {
	model := &dto.PlayerSummaryDto{}
	err := s.db.Model(&domain.Player{}).
		Select("id as player_id, first_name, last_name").
		Where("id = ?", playerId).
		First(&model).
		Error

	if err != nil {
		return nil, err
	}

	return model, nil
}
