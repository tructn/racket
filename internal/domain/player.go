package domain

type Player struct {
	BaseModel
	UserID         *uint  `json:"userId" gorm:"default:null"`
	FirstName      string `gorm:"index" json:"firstName"`
	LastName       string `json:"lastName"`
	ExternalUserID string `json:"externalUserId"`
	Email          string `json:"email"`
	Rank           uint   `json:"rank"`
	Teams          []Team `json:"teams" gorm:"many2many:team_members;"`
	User           User   `json:"user"`
}

func NewPlayer(userID uint, externalUserID, email, firstName, lastName string) *Player {
	return &Player{
		UserID:         &userID,
		ExternalUserID: externalUserID,
		Email:          email,
		FirstName:      firstName,
		LastName:       lastName,
	}
}
