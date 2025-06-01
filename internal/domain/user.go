package domain

import (
	"time"
)

// User represents a user in the system
type User struct {
	BaseModel
	IdpUserId string    `json:"idpUserId" gorm:"uniqueIndex;not null"` // Identity Provider user ID (e.g. Auth0)
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Name      string    `json:"name"`
	Picture   string    `json:"picture"` // Profile picture URL
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// NewUser creates a new user
func NewUser(idpUserId, email, name, picture string) *User {
	return &User{
		IdpUserId: idpUserId,
		Email:     email,
		Name:      name,
		Picture:   picture,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
}
