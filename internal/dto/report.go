package dto

import "time"

type RegistrationSummaryByPlayerDto struct {
	PlayerId            uint    `json:"playerId"`
	PlayerName          string  `json:"playerName"`
	MatchCount          uint    `json:"matchCount"`
	UnpaidAmount        float64 `json:"unpaidAmount"`
	RegistrationSummary string  `json:"registrationSummary"`
}

type MatchCostDetailsDto struct {
	PlayerId            uint      `json:"playerId"`
	PlayerName          string    `json:"playerName"`
	MatchDate           time.Time `json:"matchDate"`
	MatchCost           float64   `json:"matchCost"`
	MatchAdditionalCost float64   `json:"matchAdditionalCost"`
	MatchPlayerCount    uint      `json:"matchPlayerCount"`
}
