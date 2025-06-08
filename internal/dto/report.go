package dto

import "time"

type AdminOutstandingPaymentReportDto struct {
	PlayerId            uint    `json:"playerId"`
	PlayerName          string  `json:"playerName"`
	Email               string  `json:"email"`
	MatchCount          uint    `json:"matchCount"`
	UnpaidAmount        float64 `json:"unpaidAmount"`
	RegistrationSummary string  `json:"registrationSummary"`
}

type AnonymousOutstandingPaymentReportDto struct {
	PlayerId            uint      `json:"playerId"`
	TotalPlayerPaidFor  uint      `json:"totalPlayerPaidFor"`
	PlayerName          string    `json:"playerName"`
	PlayerEmail         string    `json:"playerEmail"`
	MatchDate           time.Time `json:"matchDate"`
	MatchCost           float64   `json:"matchCost"`
	MatchAdditionalCost float64   `json:"matchAdditionalCost"`
	MatchPlayerCount    uint      `json:"matchPlayerCount"`
}
