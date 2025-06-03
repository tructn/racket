package domain

type User struct {
	BaseModel
	IdpUserID string `json:"idpUserId" gorm:"uniqueIndex;not null"`
	Email     string `json:"email" gorm:"uniqueIndex;not null"`
	Name      string `json:"name"`
	Picture   string `json:"picture"`
}

func NewUser(idpUserID, email, name, picture string) *User {
	return &User{
		IdpUserID: idpUserID,
		Email:     email,
		Name:      name,
		Picture:   picture,
	}
}
