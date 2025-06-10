package dto

type WalletDto struct {
	Id        uint    `json:"id"`
	Balance   float64 `json:"balance"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}
