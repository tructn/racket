package domain

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateAccountDefaultZeroBalance(t *testing.T) {
	acc := NewWallet(1, "test_wallet")
	assert.Equal(t, float64(0), acc.Balance)
	assert.Equal(t, "test_wallet", acc.Name)
}

func TestCreditAccount(t *testing.T) {
	// Arrange
	acc := newWalletWithAmount(1, 1000)

	// Act
	acc.Credit(100, "test_credit")

	// Assert
	assert.Equal(t, float64(1100), acc.Balance)
	assert.Equal(t, uint(1), acc.OwnerId)
	assert.Equal(t, In, acc.Transactions[0].TransactionType)
	assert.Equal(t, float64(100), acc.Transactions[0].Amount)
	assert.Equal(t, "test_credit", acc.Transactions[0].Description)
}

func TestDebitAccount(t *testing.T) {
	// Arrange
	acc := newWalletWithAmount(1, 1000)

	// Act
	err := acc.Debit(100, "test_debit")

	// Assert
	assert.Nil(t, err)
	assert.Equal(t, float64(900), acc.Balance)
	assert.Equal(t, uint(1), acc.OwnerId)
	assert.Equal(t, Out, acc.Transactions[0].TransactionType)
	assert.Equal(t, float64(100), acc.Transactions[0].Amount)
	assert.Equal(t, "test_debit", acc.Transactions[0].Description)
}

func TestCreditNegativeAmount(t *testing.T) {
	acc := NewWallet(1, "")
	err := acc.Credit(-100, "test negative value")
	assert.Error(t, err)
}

func TestDebitInsufficientAmount(t *testing.T) {
	acc := NewWallet(1, "")
	err := acc.Debit(100, "test debig insufficient value")
	assert.Error(t, err)
}
