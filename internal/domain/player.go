package domain

type Player struct {
	BaseModel
	FirstName      string `gorm:"index" json:"firstName"`
	LastName       string `json:"lastName"`
	ExternalUserID string `json:"externalUserId"`
	Email          string `json:"email"`
	Rank           uint   `json:"rank"`
	Teams          []Team `json:"teams" gorm:"many2many:team_members;"`
}

func NewPlayer(externalUserID, email, firstName, lastName string) *Player {
	return &Player{
		ExternalUserID: externalUserID,
		Email:          email,
		FirstName:      firstName,
		LastName:       lastName,
	}
}
