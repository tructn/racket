package domain

type Team struct {
	BaseModel
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Members     []Player `json:"members" gorm:"many2many:team_members;"`
	OwnerID     string   `json:"ownerId" gorm:"index"`
}

type TeamMember struct {
	TeamID   uint   `json:"teamId" gorm:"primaryKey"`
	PlayerID uint   `json:"playerId" gorm:"primaryKey"`
	Role     string `json:"role"`
}

func NewTeam(name, description, ownerID string) *Team {
	team := &Team{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
	}
	return team
}

func (t *Team) AddMember(player Player, role string) {
	t.Members = append(t.Members, player)
}

func (t *Team) RemoveMember(playerID uint) {
	var updatedMembers []Player
	for _, member := range t.Members {
		if member.ID != playerID {
			updatedMembers = append(updatedMembers, member)
		}
	}
	t.Members = updatedMembers
}
