package service

import (
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/pkg/auth0"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// Users should be sync via Auth0 hook API
// This function is used to sync users from Auth0 manually
// This will create player profile
func (s *UserService) SyncPlayersFromAuth0Users(auth0Users []auth0.Auth0User) error {
	for _, auth0User := range auth0Users {
		err := s.db.Transaction(func(tx *gorm.DB) error {
			var existingPlayer domain.Player
			err := tx.Where("external_user_id = ?", auth0User.UserID).First(&existingPlayer).Error

			if err == nil {
				// Update existing player
				existingPlayer.Email = auth0User.Email
				existingPlayer.FirstName = auth0User.GivenName
				existingPlayer.LastName = auth0User.FamilyName
				if err := tx.Save(&existingPlayer).Error; err != nil {
					return err
				}
			} else {
				// Create new player if not exists
				player := domain.NewPlayer(
					auth0User.UserID,
					auth0User.Email,
					auth0User.GivenName,
					auth0User.FamilyName,
				)

				if err := tx.Create(player).Error; err != nil {
					return err
				}
			}

			return nil
		})

		if err != nil {
			return err
		}
	}
	return nil
}

func (s *UserService) GetPlayerByExternalUserId(externalUserId string) (*domain.Player, error) {
	var player domain.Player
	if err := s.db.Where("external_user_id = ?", externalUserId).First(&player).Error; err != nil {
		return nil, err
	}
	return &player, nil
}
