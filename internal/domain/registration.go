package domain

type Registration struct {
	BaseModel
	PlayerId uint   `gorm:"index" json:"playerId"`
	MatchId  uint   `gorm:"index" json:"matchId"`
	IsPaid   bool   `gorm:"index" json:"isPaid"`
	Comment  string `json:"comment"`
}

func (reg *Registration) MarkPaid() {
	reg.IsPaid = true
}

func (reg *Registration) MarkUnpaid() {
	reg.IsPaid = false
}
