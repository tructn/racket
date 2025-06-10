package domain

import "errors"

type TransactionType = int

const (
	In TransactionType = iota + 1
	Out
)

type (
	Wallet struct {
		BaseModel
		OwnerId      uint                 `gorm:"index" json:"ownerId"`
		Name         string               `json:"name"`
		Balance      float64              `json:"balance"`
		Transactions []*WalletTransaction `json:"transactions"`
		Owner        *Player              `json:"owner,omitempty"`
	}

	WalletTransaction struct {
		BaseModel
		Amount          float64         `json:"amount"`
		WalletId        uint            `json:"walletId" gorm:"index"`
		TransactionType TransactionType `json:"transactionType"`
		Description     string          `json:"description"`
	}
)

func NewWallet(ownerId uint, name string) *Wallet {
	return &Wallet{
		OwnerId: ownerId,
		Name:    name,
		Balance: 0,
	}
}

func newWalletWithAmount(ownerId uint, initAmount float64) *Wallet {
	return &Wallet{
		OwnerId: ownerId,
		Balance: initAmount,
	}
}

func (a *Wallet) addTransaction(tranType TransactionType, amount float64, description string) {
	tran := &WalletTransaction{
		WalletId:        a.ID,
		TransactionType: tranType,
		Description:     description,
		Amount:          amount,
	}
	a.Transactions = append(a.Transactions, tran)
}

func (a *Wallet) Credit(amount float64, description string) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}
	a.Balance += amount
	a.addTransaction(In, amount, description)
	return nil
}

func (a *Wallet) Debit(amount float64, description string) error {
	if amount > a.Balance {
		return errors.New("insufficient fun to debit")
	}
	a.Balance -= amount
	a.addTransaction(Out, amount, description)

	return nil
}
