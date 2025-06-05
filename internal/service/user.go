package service

import (
	"log"

	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/pkg/auth0"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) GetOrCreateByIdpUserId(idpUserId, email, firstName, lastName, picture string) (*domain.User, error) {
	var user domain.User

	err := s.db.Where("idp_user_id = ?", idpUserId).First(&user).Error
	if err == nil {
		user.Email = email
		user.FirstName = firstName
		user.LastName = lastName
		user.Picture = picture
		if err := s.db.Save(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	newUser := domain.NewIdpUser(idpUserId, email, firstName, lastName, picture)
	if err := s.db.Create(newUser).Error; err != nil {
		return nil, err
	}

	return newUser, nil
}

// Users should be sync via Auth0 hook API
// This function is used to sync users from Auth0 manually
// This will create player profile
func (s *UserService) SyncUsersFromAuth0Users(auth0Users []auth0.Auth0User) error {
	for _, auth0User := range auth0Users {
		var existingUser domain.User
		err := s.db.Where("idp_user_id = ?", auth0User.UserID).First(&existingUser).Error
		if err == nil {
			continue
		}

		err = s.db.Transaction(func(tx *gorm.DB) error {
			newUser := domain.NewIdpUser(
				auth0User.UserID,
				auth0User.Email,
				auth0User.GivenName,
				auth0User.FamilyName,
				auth0User.Picture,
			)

			if err := tx.Create(newUser).Error; err != nil {
				return err
			}

			var existingPlayer domain.Player
			err = tx.Where("external_user_id = ?", auth0User.UserID).First(&existingPlayer).Error

			if err == nil {
				existingPlayer.Email = auth0User.Email
				existingPlayer.FirstName = auth0User.GivenName
				existingPlayer.LastName = auth0User.FamilyName
				existingPlayer.UserID = &newUser.ID
				if err := tx.Save(&existingPlayer).Error; err != nil {
					return err
				}
				log.Printf("Player updated: %+v", existingPlayer)
			} else {
				// Create new player if not exists
				player := domain.NewPlayer(
					newUser.ID,
					auth0User.UserID,
					auth0User.Email,
					auth0User.GivenName,
					auth0User.FamilyName,
				)

				if err := tx.Create(player).Error; err != nil {
					return err
				}
				log.Printf("Player created: %+v", player)
			}

			return nil
		})

		if err != nil {
			return err
		}
	}
	return nil
}

func (s *UserService) GetUserByAuth0UserId(idpUserId string) (*domain.User, error) {
	var user domain.User
	if err := s.db.Where("idp_user_id = ?", idpUserId).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) UpdateProfile(userId uint, firstName, lastName, picture string) (*domain.User, error) {
	var user domain.User
	if err := s.db.First(&user, userId).Error; err != nil {
		return nil, err
	}

	user.FirstName = firstName
	user.LastName = lastName
	if picture != "" {
		user.Picture = picture
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) GetAllUsers() ([]domain.User, error) {
	var users []domain.User
	if err := s.db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserService) CreateUser(dto dto.CreateUserDto) (*domain.User, error) {
	user := domain.NewIdpUser(dto.IdpUserID, dto.Email, dto.FirstName, dto.LastName, dto.Picture)
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}
