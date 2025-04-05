package dto

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
