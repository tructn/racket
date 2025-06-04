package dto

type CreateUserDto struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Picture   string `json:"picture"`
	IdpUserID string `json:"idpUserId"`
}
