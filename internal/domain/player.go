package domain

// Player represents a player in the system.
// Player might be a user synced from an external identity provider (IdP) such as Auth0.
// It contains personal information such as first name, last name, email, and rank.
// Player also can be created manually by an admin (just a normal player entity without any login account)
type Player struct {
	BaseModel
	FirstName      string   `gorm:"index" json:"firstName"`
	LastName       string   `json:"lastName"`
	ExternalUserID string   `json:"externalUserId"`
	Email          string   `json:"email"`
	Rank           uint     `json:"rank"`
	Teams          []Team   `gorm:"many2many:team_members;" json:"teams"`
	Wallets        []Wallet `gorm:"foreignKey:OwnerId" json:"wallets"`
}

func NewPlayer(externalUserID, email, firstName, lastName string) *Player {
	return &Player{
		ExternalUserID: externalUserID,
		Email:          email,
		FirstName:      firstName,
		LastName:       lastName,
	}
}
