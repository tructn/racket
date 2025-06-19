package domain

import "testing"

func TestIndividualCost(t *testing.T) {
	tests := []struct {
		name         string
		match        Match
		expectedCost float64
	}{
		{
			name: "No additional costs and no registrations",
			match: Match{
				Cost:            100,
				AdditionalCosts: []AdditionalCost{},
				Registrations:   []Registration{},
			},
			expectedCost: 0,
		},
		{
			name: "No additional costs with registrations",
			match: Match{
				Cost:            100,
				AdditionalCosts: []AdditionalCost{},
				Registrations: []Registration{{
					TotalPlayerPaidFor: 1,
				}, {
					TotalPlayerPaidFor: 1,
				}, {
					TotalPlayerPaidFor: 1,
				}}, // 3 players
			},
			expectedCost: 33.333333333333336,
		},
		{
			name: "With additional costs and registrations",
			match: Match{
				Cost: 100,
				AdditionalCosts: []AdditionalCost{
					{Amount: 50},
					{Amount: 25},
				},
				Registrations: []Registration{{
					TotalPlayerPaidFor: 1,
				}, {
					TotalPlayerPaidFor: 1,
				}, {
					TotalPlayerPaidFor: 1,
				}}, // 3 players
			},
			expectedCost: 58.333333333333336,
		},
		{
			name: "One player paid for multiple players",
			match: Match{
				Cost:            100,
				AdditionalCosts: []AdditionalCost{},
				Registrations: []Registration{{
					TotalPlayerPaidFor: 2,
				}, {
					TotalPlayerPaidFor: 1,
				}, {
					TotalPlayerPaidFor: 1,
				}}, // 3 players
			},
			expectedCost: 25.0,
		},
		{
			name: "With additional costs and no registrations",
			match: Match{
				Cost: 100,
				AdditionalCosts: []AdditionalCost{
					{Amount: 50},
					{Amount: 25},
				},
				Registrations: []Registration{},
			},
			expectedCost: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.match.CalcIndividualCost()
			if got != tt.expectedCost {
				t.Errorf("CalcIndividualCost() = %v, want %v", got, tt.expectedCost)
			}
		})
	}
}
