package service

import (
	"github.com/tructn/racket/internal/dto"
	"gorm.io/gorm"
)

type PaymentService struct {
	db *gorm.DB
}

func NewPaymentService(db *gorm.DB) *PaymentService {
	return &PaymentService{
		db: db,
	}
}

func (s *PaymentService) GetOutstandingPaymentReportForAdmin() ([]dto.AdminOutstandingPaymentReportDto, error) {
	sql := `
	WITH cte_match_costs AS (
		SELECT 
			m.id AS match_id, 
			m.sport_center_id AS sport_center_id,
			-- (Base cost + Total additional cost) / Total players paid for
			(m.cost + COALESCE(acx.additional_cost, 0)) / SUM(r.total_player_paid_for) AS individual_cost
		FROM matches m
		JOIN registrations r ON m.id = r.match_id
		-- Getting SUM of additional cost to add with base cost
		LEFT JOIN LATERAL (
			SELECT ac.match_id, SUM(ac.amount) AS additional_cost
			FROM additional_costs ac
			GROUP BY ac.match_id
		) acx ON acx.match_id = m.id
		WHERE 
			m.deleted_at is null
			AND r.deleted_at is null
		GROUP BY m.id, m.sport_center_id, acx.additional_cost
	)
	SELECT
		p.id AS player_id, 
		CONCAT(p.first_name,' ', p.last_name) AS player_name,
		p.email,
		COUNT(cte.match_id) AS match_count,
		SUM(cte.individual_cost * r.total_player_paid_for) AS unpaid_amount
	FROM registrations r
	JOIN cte_match_costs cte ON cte.match_id = r.match_id
	JOIN sport_centers sc ON cte.sport_center_id = sc.id
	JOIN players p ON r.player_id = p.id
	WHERE 
		r.is_paid = false
		AND r.deleted_at is null
		AND p.deleted_at is null
	GROUP BY p.id
	ORDER by player_name
	`
	result := []dto.AdminOutstandingPaymentReportDto{}
	if err := s.db.Raw(sql).Scan(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}

func (s *PaymentService) GetOutstandingPaymentReportForAnonymous() ([]dto.AnonymousOutstandingPaymentReportDto, error) {
	sql := `with 
		cte_addtional_costs as (
			select ac.match_id, sum(ac.amount) as total
			from public.additional_costs ac 
			group by ac.match_id
		),
		cte_player_counts as (
			select 
				m.id as match_id, 
				m."cost" as match_cost, 
				ac.total as match_additional_cost, 
				m."start" as match_date,  
				SUM(r.total_player_paid_for) as match_player_count
			from public.registrations r
			join public.matches m  on r.match_id = m.id
			left join cte_addtional_costs ac on ac.match_id = m.id
			where m.deleted_at is null 
				and r.deleted_at is null
			group by 
				m.id, 
				m."cost", 
				m.start, 
				ac.total
		)
		select 
			p.id as player_id,
			r.total_player_paid_for, 
			CONCAT(p.first_name, ' ', p.last_name) as player_name, 
			p.email as player_email,
			pc.match_id, 
			pc.match_date, 
			pc.match_cost, 
			pc.match_additional_cost,
			pc.match_player_count
		from public.registrations r
		join public.players p on p.id = r.player_id
		join cte_player_counts pc on pc.match_id  = r.match_id
		where r.is_paid = false AND r.deleted_at is null
	`

	result := []dto.AnonymousOutstandingPaymentReportDto{}
	if err := s.db.Raw(sql).Scan(&result).Error; err != nil {
		return nil, err
	}
	return result, nil
}
