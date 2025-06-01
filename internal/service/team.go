package service

import (
	"time"

	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"gorm.io/gorm"
)

type TeamService struct {
	db *gorm.DB
}

func NewTeamService(db *gorm.DB) *TeamService {
	return &TeamService{db: db}
}

// CreateTeam creates a new team for a user
func (s *TeamService) CreateTeam(req dto.CreateTeamRequest, ownerID string) (*domain.Team, error) {
	team := domain.NewTeam(req.Name, req.Description, ownerID)

	if err := s.db.Create(team).Error; err != nil {
		return nil, err
	}

	return team, nil
}

// GetTeams retrieves all teams for a user
func (s *TeamService) GetTeams(ownerID string) ([]domain.Team, error) {
	var teams []domain.Team
	if err := s.db.Preload("Members").Preload("Bookings").Preload("Costs").
		Where("owner_id = ?", ownerID).
		Find(&teams).Error; err != nil {
		return nil, err
	}
	return teams, nil
}

// GetTeam retrieves a team by ID
func (s *TeamService) GetTeam(id uint, ownerID string) (*domain.Team, error) {
	var team domain.Team
	if err := s.db.Preload("Members").Preload("Bookings").Preload("Costs").
		Where("id = ? AND owner_id = ?", id, ownerID).First(&team).Error; err != nil {
		return nil, err
	}
	return &team, nil
}

// UpdateTeam updates a team's information
func (s *TeamService) UpdateTeam(id uint, req dto.UpdateTeamRequest, ownerID string) error {
	return s.db.Model(&domain.Team{}).
		Where("id = ? AND owner_id = ?", id, ownerID).
		Updates(map[string]interface{}{
			"name":        req.Name,
			"description": req.Description,
			"updated_at":  time.Now().UTC(),
		}).Error
}

// DeleteTeam deletes a team
func (s *TeamService) DeleteTeam(id uint, ownerID string) error {
	return s.db.Where("id = ? AND owner_id = ?", id, ownerID).Delete(&domain.Team{}).Error
}

// AddPlayer adds a player to a team
func (s *TeamService) AddPlayer(teamID uint, playerID uint, role string, ownerID string) error {
	teamMember := domain.TeamMember{
		TeamID:   teamID,
		PlayerID: playerID,
		Role:     role,
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND owner_id = ?", teamID, ownerID).First(&team).Error; err != nil {
			return err
		}

		return tx.Create(&teamMember).Error
	})
}

// RemovePlayer removes a player from a team
func (s *TeamService) RemovePlayer(teamID uint, playerID uint, ownerID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND owner_id = ?", teamID, ownerID).First(&team).Error; err != nil {
			return err
		}

		return tx.Where("team_id = ? AND player_id = ?", teamID, playerID).Delete(&domain.TeamMember{}).Error
	})
}

// CreateBooking creates a new booking for a team
func (s *TeamService) CreateBooking(teamID uint, req dto.CreateBookingRequest, ownerID string) (*domain.Booking, error) {
	booking := &domain.Booking{
		TeamID:      teamID,
		CourtID:     req.CourtID,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		Status:      "pending",
		Description: req.Description,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND owner_id = ?", teamID, ownerID).First(&team).Error; err != nil {
			return err
		}

		return tx.Create(booking).Error
	})

	if err != nil {
		return nil, err
	}

	return booking, nil
}

// CreateCost creates a new cost for a team
func (s *TeamService) CreateCost(teamID uint, req dto.CreateCostRequest, ownerID string) (*domain.Cost, error) {
	cost := &domain.Cost{
		TeamID:      teamID,
		Amount:      req.Amount,
		Description: req.Description,
		Date:        req.Date,
		Category:    req.Category,
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var team domain.Team
		if err := tx.Where("id = ? AND owner_id = ?", teamID, ownerID).First(&team).Error; err != nil {
			return err
		}

		return tx.Create(cost).Error
	})

	if err != nil {
		return nil, err
	}

	return cost, nil
}

// GetTeamBookings retrieves all bookings for a team
func (s *TeamService) GetTeamBookings(teamID uint, ownerID string) ([]domain.Booking, error) {
	var bookings []domain.Booking
	err := s.db.Joins("JOIN teams ON teams.id = bookings.team_id").
		Where("teams.id = ? AND teams.owner_id = ?", teamID, ownerID).
		Find(&bookings).Error
	return bookings, err
}

// GetTeamCosts retrieves all costs for a team
func (s *TeamService) GetTeamCosts(teamID uint, ownerID string) ([]domain.Cost, error) {
	var costs []domain.Cost
	err := s.db.Joins("JOIN teams ON teams.id = costs.team_id").
		Where("teams.id = ? AND teams.owner_id = ?", teamID, ownerID).
		Find(&costs).Error
	return costs, err
}
