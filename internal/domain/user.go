package domain

type User struct {
	BaseModel
	IdpUserID string `json:"idpUserId" gorm:"uniqueIndex;not null"`
	Email     string `json:"email" gorm:"uniqueIndex;not null"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Picture   string `json:"picture"`
}

func NewIdpUser(idpUserID, email, firstName, lastName, picture string) *User {
	return &User{
		IdpUserID: idpUserID,
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Picture:   picture,
	}
}
