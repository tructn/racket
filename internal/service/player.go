package service

import (
	"github.com/tructn/racket/internal/dto"
)

type PlayerService interface {
	GetPlayerSummary(playerId uint) (*dto.PlayerSummaryDto, error)
}
