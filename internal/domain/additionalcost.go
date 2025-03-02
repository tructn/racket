package domain

import "errors"

type AdditionalCost struct {
	BaseModel
	MatchId     uint    `gorm:"index" json:"matchId"`
	Match       Match   `gorm:"foreignKey:MatchId" json:"match"`
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

func NewCost(matchId uint, description string, amount float64) (*AdditionalCost, error) {
	if amount <= 0 {
		return nil, errors.New("invalid amount")
	}
	if len(description) == 0 {
		return nil, errors.New("description must be provided")
	}

	return &AdditionalCost{
		MatchId:     matchId,
		Description: description,
		Amount:      amount,
	}, nil
}
