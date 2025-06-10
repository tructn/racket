package wallet

import "github.com/tructn/racket/internal/domain"

type (
	walletDto struct {
		Id           uint             `json:"id"`
		Name         string           `json:"name"`
		OwnerId      uint             `json:"ownerId"`
		OwnerName    string           `json:"ownerName"`
		Balance      float64          `json:"balance"`
		Transactions []transactionDto `json:"transactions"`
	}

	transactionDto struct {
		Id              uint                   `json:"id"`
		WalletId        uint                   `json:"walletId"`
		TransactionType domain.TransactionType `json:"transactionType"`
		Description     string                 `json:"description"`
		Amount          float64                `json:"amount"`
		CreatedAt       string                 `json:"createdAt"`
		UpdatedAt       string                 `json:"updatedAt"`
	}

	createWalletDto struct {
		OwnerId uint   `json:"ownerId"`
		Name    string `json:"name"`
	}
)
