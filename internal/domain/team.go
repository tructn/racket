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
	Bookings    []Booking `json:"bookings" gorm:"foreignKey:TeamID"`
	Costs       []Cost    `json:"costs" gorm:"foreignKey:TeamID"`
}

// TeamMember represents the relationship between teams and players
type TeamMember struct {
	TeamID   uint   `json:"teamId" gorm:"primaryKey"`
	PlayerID uint   `json:"playerId" gorm:"primaryKey"`
	Role     string `json:"role"` // e.g., "captain", "member"
}

// Booking represents a court booking made by the team
type Booking struct {
	BaseModel
	TeamID      uint      `json:"teamId" gorm:"index"`
	CourtID     uint      `json:"courtId" gorm:"index"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	Status      string    `json:"status"` // "pending", "confirmed", "cancelled"
	TotalCost   float64   `json:"totalCost"`
	Description string    `json:"description"`
}

// Cost represents a cost associated with the team
type Cost struct {
	BaseModel
	TeamID      uint      `json:"teamId" gorm:"index"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Category    string    `json:"category"` // e.g., "court", "equipment", "other"
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

// AddBooking adds a new booking to the team
func (t *Team) AddBooking(booking Booking) {
	t.Bookings = append(t.Bookings, booking)
}

// AddCost adds a new cost to the team
func (t *Team) AddCost(cost Cost) {
	t.Costs = append(t.Costs, cost)
}
