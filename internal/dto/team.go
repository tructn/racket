package dto

import (
	"time"
)

// TeamCreateDto represents the data needed to create a new team
type TeamCreateDto struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// TeamUpdateDto represents the data needed to update a team
type TeamUpdateDto struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// TeamResponseDto represents the team data returned to the client
type TeamResponseDto struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	OwnerID     string `json:"ownerId"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
	Members     []uint `json:"memberIds"`
	MemberCount int    `json:"memberCount"`
}

// TeamMemberDto represents the data needed to add a member to a team
type TeamMemberDto struct {
	PlayerID uint   `json:"playerId" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// CreateTeamRequest represents the request to create a new team
type CreateTeamRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// UpdateTeamRequest represents the request to update a team
type UpdateTeamRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// TeamResponse represents the response for team data
type TeamResponse struct {
	ID          uint              `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	OwnerID     string            `json:"ownerId"`
	TenantID    uint              `json:"tenantId"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
	Members     []PlayerResponse  `json:"members"`
	Bookings    []BookingResponse `json:"bookings"`
	Costs       []CostResponse    `json:"costs"`
}

// PlayerResponse represents the response for player data
type PlayerResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
	Role  string `json:"role"`
}

// BookingResponse represents the response for booking data
type BookingResponse struct {
	ID          uint      `json:"id"`
	CourtID     uint      `json:"courtId"`
	StartTime   time.Time `json:"startTime"`
	EndTime     time.Time `json:"endTime"`
	Status      string    `json:"status"`
	TotalCost   float64   `json:"totalCost"`
	Description string    `json:"description"`
}

// CostResponse represents the response for cost data
type CostResponse struct {
	ID          uint      `json:"id"`
	Amount      float64   `json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Category    string    `json:"category"`
}

// CreateBookingRequest represents the request to create a new booking
type CreateBookingRequest struct {
	CourtID     uint      `json:"courtId" binding:"required"`
	StartTime   time.Time `json:"startTime" binding:"required"`
	EndTime     time.Time `json:"endTime" binding:"required"`
	Description string    `json:"description"`
}

// CreateCostRequest represents the request to create a new cost
type CreateCostRequest struct {
	Amount      float64   `json:"amount" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Date        time.Time `json:"date" binding:"required"`
	Category    string    `json:"category" binding:"required"`
}
