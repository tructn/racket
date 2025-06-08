package dto

type (
	RegistrationOverviewDto struct {
		RegistrationId     uint   `json:"registrationId"`
		MatchId            uint   `json:"matchId"`
		PlayerId           uint   `json:"playerId"`
		PlayerName         string `json:"playerName"`
		TotalPlayerPaidFor uint   `json:"totalPlayerPaidFor"`
		Email              string `json:"email"`
		IsPaid             bool   `json:"isPaid"`
	}

	RegistrationDto struct {
		PlayerId uint `json:"playerId"`
		MatchId  uint `json:"matchId"`
	}

	MatchRegistrationDto struct {
		MatchId uint `json:"matchId"`
	}

	AttendantRequestDto struct {
		FirstName      string `json:"firstName"`
		LastName       string `json:"lastName"`
		Email          string `json:"email"`
		ExternalUserId string `json:"externalUserId"`
		MatchId        uint   `json:"matchId"`
	}

	PlayerAttendantRequestDto struct {
		MatchId  uint `json:"matchId"`
		PlayerId uint `json:"playerId"`
	}

	UpdateTotalPlayerPaidForDto struct {
		Count uint `json:"count"`
	}
)
