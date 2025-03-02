package dto

type TransactionDto struct {
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}
