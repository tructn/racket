package service

import (
	"encoding/json"
	"fmt"

	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ActivityService struct {
	db        *gorm.DB
	logger    *zap.SugaredLogger
	matchsvc  *MatchService
	playersvc *PlayerService
}

func NewActivityService(
	db *gorm.DB,
	logger *zap.SugaredLogger,
	matchsvc *MatchService,
	playersvc *PlayerService,
) *ActivityService {
	return &ActivityService{
		db:        db,
		logger:    logger,
		matchsvc:  matchsvc,
		playersvc: playersvc,
	}
}

func (s *ActivityService) Get() []dto.ActivityDto {
	activities := []domain.Activity{}
	if err := s.db.Limit(50).Order("created_at desc").Find(&activities).Error; err != nil {
		return []dto.ActivityDto{}
	}

	return lo.Map(activities, func(ac domain.Activity, _ int) dto.ActivityDto {
		return dto.ActivityDto{
			TypeId:      ac.TypeId,
			TypeName:    ac.GetTypeName(),
			Description: ac.Description,
			Payload:     ac.Payload,
			CreatedDate: ac.CreatedAt,
		}
	})
}

// TODO: consider passing transaction into here when reuse ?
func (s *ActivityService) BuildRegisterActivity(playerId, matchId uint) (*domain.Activity, error) {
	player, _ := s.playersvc.GetPlayerSummary(playerId)
	match, _ := s.matchsvc.GetMatchSummary(matchId)

	data := struct {
		PlayerId    uint   `json:"playerId"`
		Player      string `json:"player"`
		SportCenter string `json:"sportCenter"`
	}{
		PlayerId:    player.PlayerId,
		Player:      fmt.Sprintf("%s %s", player.FirstName, player.LastName),
		SportCenter: match.SportCenterName,
	}

	payload, err := json.Marshal(data)
	if err != nil {
		s.logger.Errorf("Unable to parse data json %s", err.Error())
		return nil, err
	}
	return &domain.Activity{
		TypeId:      domain.MatchRegistered,
		Description: fmt.Sprintf("%s registered %s on %s", data.Player, match.SportCenterName, match.Start.Format("02/01/2006")),
		Payload:     string(payload),
	}, nil
}

// TODO: consider passing transaction into here when reuse ?
func (s *ActivityService) BuildUnregisterActivity(playerId, matchId uint) (*domain.Activity, error) {
	player, _ := s.playersvc.GetPlayerSummary(playerId)
	match, _ := s.matchsvc.GetMatchSummary(matchId)

	data := struct {
		PlayerId    uint   `json:"playerId"`
		Player      string `json:"player"`
		SportCenter string `json:"sportCenter"`
	}{
		PlayerId:    player.PlayerId,
		Player:      fmt.Sprintf("%s %s", player.FirstName, player.LastName),
		SportCenter: match.SportCenterName,
	}

	payload, err := json.Marshal(data)
	if err != nil {
		s.logger.Errorf("Unable to parse data json %s", err.Error())
		return nil, err
	}
	return &domain.Activity{
		TypeId:      domain.MatchUnRegistered,
		Description: fmt.Sprintf("%s unregistered %s on %s", data.Player, match.SportCenterName, match.Start.Format("02/01/2006")),
		Payload:     string(payload),
	}, nil
}
