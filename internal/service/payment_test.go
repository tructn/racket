package service_test

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/tructn/racket/internal/dto"
	"github.com/tructn/racket/internal/service"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type MockDB struct {
	mock.Mock
}

func TestGetUnpaidConcatByPlayer(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	paymentService := service.NewPaymentService(db)

	expectedResult := []dto.RegistrationSummaryByPlayerDto{
		{
			PlayerId:            1,
			PlayerName:          "John Doe",
			MatchCount:          2,
			UnpaidAmount:        50.0,
			RegistrationSummary: "01.Mar.2024:£25.00,15.Feb.2024:£25.00",
		},
	}

	db.Exec(`INSERT INTO players (id, first_name, last_name) VALUES (1, 'John', 'Doe')`)
	db.Exec(`INSERT INTO matches (id, sport_center_id, cost, start) VALUES (1, 1, 100, '2024-03-01')`)
	db.Exec(`INSERT INTO registrations (id, player_id, match_id, is_paid) VALUES (1, 1, 1, false)`)

	result, err := paymentService.GetUnpaidConcatByPlayer()

	assert.NoError(t, err)
	assert.Equal(t, expectedResult, result)
}

func TestGetUnpaidDetails(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	defer func() {
		sqlDB, _ := db.DB()
		sqlDB.Close()
	}()

	paymentService := service.NewPaymentService(db)

	matchDate, _ := time.Parse("2006-01-02", "2024-03-01")

	expectedResult := []dto.MatchCostDetailsDto{
		{
			PlayerId:            1,
			PlayerName:          "John Doe",
			MatchDate:           matchDate,
			MatchCost:           100,
			MatchAdditionalCost: 20,
			MatchPlayerCount:    4,
		},
	}

	db.Exec(`INSERT INTO players (id, first_name, last_name) VALUES (1, 'John', 'Doe')`)
	db.Exec(`INSERT INTO matches (id, sport_center_id, cost, start) VALUES (1, 1, 100, '2024-03-01')`)
	db.Exec(`INSERT INTO additional_costs (id, match_id, amount) VALUES (1, 1, 20)`)
	db.Exec(`INSERT INTO registrations (id, player_id, match_id, is_paid) VALUES (1, 1, 1, false)`)

	result, err := paymentService.GetUnpaidDetails()

	assert.NoError(t, err)
	assert.Equal(t, expectedResult, result)
}
