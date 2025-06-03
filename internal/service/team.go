package service

import (
	"context"
	"time"

	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/pkg/scopes"
	"gorm.io/gorm"
)

type TeamService struct {
	db *gorm.DB
}

func NewTeamService(db *gorm.DB) *TeamService {
	return &TeamService{db: db}
}

func (s *TeamService) CreateTeam(req dto.CreateTeamRequest, userId string) (*domain.Team, error) {
	team := domain.NewTeam(req.Name, req.Description, userId)

	if err := s.db.Create(team).Error; err != nil {
		return nil, err
	}

	return team, nil
}

func (s *TeamService) GetTeams(ctx context.Context) ([]domain.Team, error) {
	var teams []domain.Team
	if err := s.db.
		Scopes(scopes.UserScope(ctx)).
		Preload("Members").
		Find(&teams).Error; err != nil {
		return nil, err
	}
	return teams, nil
}

func (s *TeamService) GetTeam(id uint, userId string) (*domain.Team, error) {
	var team domain.Team
	if err := s.db.Preload("Members").
		Where("id = ? AND owner_id = ?", id, userId).First(&team).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

func (s *TeamService) UpdateTeam(id uint, req dto.UpdateTeamRequest, userId string) error {
	return s.db.Model(&domain.Team{}).
		Where("id = ? AND created_by_user_id = ?", id, userId).
		Updates(map[string]interface{}{
			"name":        req.Name,
			"description": req.Description,
			"updated_at":  time.Now().UTC(),
		}).Error
}

func (s *TeamService) DeleteTeam(id uint, ownerID string) error {
	return s.db.Where("id = ? AND created_by_user_id = ?", id, ownerID).Delete(&domain.Team{}).Error
}

func (s *TeamService) AddPlayer(teamID uint, playerID uint, role string, ownerID string) error {
	teamMember := domain.TeamMember{
		TeamID:   teamID,
		PlayerID: playerID,
		Role:     role,
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND created_by_user_id = ?", teamID, ownerID).First(&team).Error; err != nil {
			return err
		}

		return tx.Create(&teamMember).Error
	})
}

func (s *TeamService) RemovePlayer(teamID uint, playerID uint, createdByID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND created_by_user_id = ?", teamID, createdByID).First(&team).Error; err != nil {
			return err
		}

		return tx.Where("team_id = ? AND player_id = ?", teamID, playerID).Delete(&domain.TeamMember{}).Error
	})
}
