package domain

import (
	"encoding/json"
	"errors"
	"math"
	"time"

	"github.com/samber/lo"
)

type Match struct {
	BaseModel
	Start           time.Time        `json:"start"`
	End             time.Time        `json:"end"`
	SportCenterId   uint             `json:"sportCenterId"`
	Cost            float64          `json:"cost"`
	AdditionalCosts []AdditionalCost `json:"additionalCosts"`
	SportCenter     SportCenter      `json:"sportCenter"`
	Court           string           `json:"court"`
	CustomSection   *float64         `gorm:"default:null" json:"customSection"`
	Comment         string           `json:"comment"`
	Registrations   []Registration   `json:"registrations"`
}

func NewMatch(
	start,
	end time.Time,
	sportCenterId uint,
	costPerSection float64,
	minutePerSection float64,
	court string,
	customSection *float64,
) *Match {
	match := &Match{
		SportCenterId: sportCenterId,
		Start:         start,
		End:           end,
		Court:         court,
		CustomSection: customSection,
	}
	match.calculateCost(minutePerSection, costPerSection)
	return match
}

func (m *Match) UpdateMatch(
	sportCenterId uint,
	start,
	end time.Time,
	minutePerSection float64,
	costPerSection float64,
	court string,
	customSection *float64,
) error {
	if sportCenterId == 0 {
		return errors.New("sport center is invalid")
	}

	if end.Before(start) {
		return errors.New("end date must be equal or after start date")
	}

	m.SportCenterId = sportCenterId
	m.Start = start
	m.End = end
	m.Court = court
	m.CustomSection = customSection
	m.calculateCost(minutePerSection, costPerSection)

	return nil
}

func (m *Match) UpdateCost(cost float64, comment string) error {
	if cost <= 0 {
		return errors.New("invalid cost")
	}

	m.Cost = cost
	m.Comment = comment

	return nil
}

func (m *Match) AddCost(description string, amount float64) error {
	cost, err := NewCost(m.ID, description, amount)
	if err != nil {
		return err
	}

	m.AdditionalCosts = append(m.AdditionalCosts, *cost)
	return nil
}

func (m *Match) CalcPlayerCount() int {
	sum := lo.SumBy(m.Registrations, func(r Registration) float64 { return float64(r.TotalPlayerPaidFor) })
	return int(sum)
}

func (m *Match) Clone() Match {
	var clone Match
	data, _ := json.Marshal(m)
	json.Unmarshal(data, &clone)
	clone.ID = 0
	clone.Start = clone.Start.AddDate(0, 0, 7)
	clone.End = clone.End.AddDate(0, 0, 7)
	return clone
}

func (m *Match) CalcAdditionalCost() float64 {
	return lo.SumBy(m.AdditionalCosts, func(ac AdditionalCost) float64 { return ac.Amount })
}

func (m *Match) CalcIndividualCost() float64 {

	additionalCost := lo.SumBy(m.AdditionalCosts, func(ac AdditionalCost) float64 {
		return ac.Amount
	})

	playerCount := len(m.Registrations)

	if playerCount != 0 {
		return (m.Cost + additionalCost) / float64(playerCount)
	}

	return 0
}

func (m *Match) calculateCost(minutePerSection, costPerSection float64) float64 {
	totalMinutes := math.Abs(m.End.Sub(m.Start).Minutes())
	var sectionCount float64
	if m.CustomSection != nil {
		sectionCount = float64(*m.CustomSection)
	} else {
		sectionCount = totalMinutes / minutePerSection
	}

	m.Cost = sectionCount * costPerSection

	return m.Cost
}
