package player

import (
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"gorm.io/gorm"
)

type playerService struct {
	db *gorm.DB
}

func NewPlayerService(db *gorm.DB) service.PlayerService {
	return &playerService{
		db: db,
	}
}

func (s *playerService) GetPlayerSummary(playerId uint) (*dto.PlayerSummaryDto, error) {
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

var _ service.PlayerService = (*playerService)(nil)
