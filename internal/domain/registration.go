package domain

type Registration struct {
	BaseModel
	PlayerId           uint   `gorm:"index" json:"playerId"`
	MatchId            uint   `gorm:"index" json:"matchId"`
	TotalPlayerPaidFor uint   `gorm:"default:1" json:"totalPlayerPaidFor"`
	IsPaid             bool   `gorm:"index" json:"isPaid"`
	Comment            string `json:"comment"`
}

func NewRegistration(playerId, matchId uint) *Registration {
	return &Registration{
		PlayerId: playerId,
		MatchId:  matchId,
		IsPaid:   false,
		// By default, main player is registered for a match
		TotalPlayerPaidFor: 1,
		Comment:            "",
	}
}

func (reg *Registration) UpdatePlayerPaidForCount(count uint) {
	if count < 1 {
		count = 1
	}
	reg.TotalPlayerPaidFor = count
}

func (reg *Registration) MarkPaid() {
	reg.IsPaid = true
}

func (reg *Registration) MarkUnpaid() {
	reg.IsPaid = false
}
