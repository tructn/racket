package service

import (
	"time"

	"gorm.io/gorm"
)

type UnpaidByPlayer struct {
	PlayerId            uint    `json:"playerId"`
	PlayerName          string  `json:"playerName"`
	MatchCount          uint    `json:"matchCount"`
	UnpaidAmount        float64 `json:"unpaidAmount"`
	RegistrationSummary string  `json:"registrationSummary"`
}

type UnpaidByPlayerV2 struct {
	PlayerId            uint      `json:"playerId"`
	PlayerName          string    `json:"playerName"`
	MatchDate           time.Time `json:"matchDate"`
	MatchCost           float64   `json:"matchCost"`
	MatchAdditionalCost float64   `json:"matchAdditionalCost"`
	MatchPlayerCount    uint      `json:"matchPlayerCount"`
}

type ReportingService struct {
	db *gorm.DB
}

func NewReportingService(db *gorm.DB) *ReportingService {
	return &ReportingService{
		db: db,
	}
}

func (s *ReportingService) GetUnpaidReport() ([]UnpaidByPlayer, error) {
	result := []UnpaidByPlayer{}
	if err := s.db.Raw(`
	WITH cte_match_costs AS (
		SELECT 
			m.id AS match_id, 
			m.sport_center_id AS sport_center_id,
			-- (Base cost + Total additional cost) / Number of Player
			(m.cost + COALESCE(acx.additional_cost, 0)) / COUNT(r.id) AS individual_cost
		FROM matches m
		JOIN registrations r ON m.id = r.match_id

		-- Getting SUM of additional cost to add with base cost
		LEFT JOIN LATERAL (
			SELECT ac.match_id, SUM(ac.amount) AS additional_cost
			FROM additional_costs ac
			GROUP BY ac.match_id
		) acx ON acx.match_id = m.id
		GROUP BY m.id, m.sport_center_id, acx.additional_cost
	),
	cte_registration_history AS (
		SELECT p.id AS player_id, STRING_AGG(TO_CHAR(m.start, 'DD.Mon.YYYY') || ':' || '£' ||ROUND(mc.individual_cost, 2), ',' ORDER BY m.start DESC) AS registration_summary
		FROM registrations r
		JOIN matches m ON m.id = r.match_id
		JOIN players p on p.id = r.player_id
		JOIN cte_match_costs mc ON m.id = mc.match_id
		WHERE r.is_paid = false
		GROUP BY p.id
	)
	SELECT
		p.id AS player_id, 
		CONCAT(p.first_name,' ', p.last_name) AS player_name,
		COUNT(cte.match_id) AS match_count,
		SUM(cte.individual_cost) AS unpaid_amount,
		cte2.registration_summary
	FROM registrations r
	JOIN cte_match_costs cte ON cte.match_id = r.match_id
	JOIN sport_centers sc ON cte.sport_center_id = sc.id
	JOIN players p ON r.player_id = p.id
	JOIN cte_registration_history cte2 ON cte2.player_id = p.id
	WHERE r.is_paid = false	
	GROUP BY p.id, cte2.registration_summary
	ORDER by player_name
	`).Scan(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (s *ReportingService) GetUnpaidReportV2() ([]UnpaidByPlayerV2, error) {
	result := []UnpaidByPlayerV2{}
	if err := s.db.Raw(`with 
cte_addtional_costs as (
	select ac.match_id, sum(ac.amount) as total
	from public.additional_costs ac 
	group by ac.match_id
),
cte_player_counts as (
	select m.id as match_id, m."cost" as match_cost, ac.total as match_additional_cost, m."start" as match_date,  COUNT(r.id) as match_player_count
	from public.registrations r
	join public.matches m  on r.match_id = m.id
	left join cte_addtional_costs ac on ac.match_id = m.id
	group by m.id, m."cost", m.start, ac.total
)
select p.id as player_id, CONCAT(p.first_name, ' ', p.last_name) as player_name, pc.match_id, pc.match_date, pc.match_cost, pc.match_additional_cost, pc.match_player_count
from public.registrations r
join public.players p on p.id = r.player_id
join cte_player_counts pc on pc.match_id  = r.match_id
`).Scan(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}
