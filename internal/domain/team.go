package domain

import (
	"time"
)

// Team represents a badminton team that can be created and managed by users
type Team struct {
	BaseModel
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     string    `json:"ownerId" gorm:"index"` // Auth0 user ID
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Members     []Player  `json:"members" gorm:"many2many:team_members;"`
}

// TeamMember represents the relationship between teams and players
type TeamMember struct {
	TeamID   uint   `json:"teamId" gorm:"primaryKey"`
	PlayerID uint   `json:"playerId" gorm:"primaryKey"`
	Role     string `json:"role"` // e.g., "captain", "member"
}

// NewTeam creates a new team with the given name and owner
func NewTeam(name, description, ownerID string) *Team {
	return &Team{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}
}

// AddMember adds a player to the team
func (t *Team) AddMember(player Player, role string) {
	t.Members = append(t.Members, player)
}

// RemoveMember removes a player from the team
func (t *Team) RemoveMember(playerID uint) {
	var updatedMembers []Player
	for _, member := range t.Members {
		if member.ID != playerID {
			updatedMembers = append(updatedMembers, member)
		}
	}
	t.Members = updatedMembers
}
