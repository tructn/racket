package service

import (
	"github.com/tructn/racket/internal/domain"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// GetOrCreateUser gets a user by IDP user ID or creates a new one if it doesn't exist
func (s *UserService) GetOrCreateUser(idpUserId, email, name, picture string) (*domain.User, error) {
	var user domain.User

	// Try to find existing user
	err := s.db.Where("idp_user_id = ?", idpUserId).First(&user).Error
	if err == nil {
		// User exists, update their info
		user.Email = email
		user.Name = name
		user.Picture = picture
		if err := s.db.Save(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// User doesn't exist, create new one
	newUser := domain.NewUser(idpUserId, email, name, picture)
	if err := s.db.Create(newUser).Error; err != nil {
		return nil, err
	}

	return newUser, nil
}

// GetUserByIdpUserId gets a user by their IDP user ID
func (s *UserService) GetUserByIdpUserId(idpUserId string) (*domain.User, error) {
	var user domain.User
	if err := s.db.Where("idp_user_id = ?", idpUserId).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateProfile updates a user's profile information
func (s *UserService) UpdateProfile(idpUserId, name, picture string) (*domain.User, error) {
	var user domain.User
	if err := s.db.Where("idp_user_id = ?", idpUserId).First(&user).Error; err != nil {
		return nil, err
	}

	user.Name = name
	if picture != "" {
		user.Picture = picture
	}

	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}
