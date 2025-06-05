package service

import (
	"log"
	"strconv"

	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SportCenterService struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewSportCenterService(db *gorm.DB, logger *zap.SugaredLogger) *SportCenterService {
	return &SportCenterService{
		db:     db,
		logger: logger,
	}
}

func (s *SportCenterService) GetAll() ([]dto.SportCenterDto, error) {
	sportCenters, err := s.getSportCenters()
	if err != nil {
		return nil, err
	}
	s.logger.Debug(sportCenters)

	result := lo.Map(sportCenters, func(item domain.SportCenter, _ int) dto.SportCenterDto {
		return dto.SportCenterDto{
			ID:               item.ID,
			Name:             item.Name,
			Location:         item.Location,
			CostPerSection:   item.CostPerSection,
			MinutePerSection: item.MinutePerSection,
		}
	})
	return result, nil
}

func (s *SportCenterService) Create(
	name,
	location string,
	costPerSection float64,
	minutePerSection uint,
) error {
	center := domain.NewSportCenter(name, location, costPerSection, minutePerSection)
	err := s.db.Create(center).Error
	return err
}

func (s *SportCenterService) Update(
	id,
	name,
	location string,
	costPerSection float64,
	minutePerSection uint,
) error {
	entity := domain.SportCenter{}

	if err := s.db.Find(&entity, id).Error; err != nil {
		log.Printf("Error finding sport center: %v", err)
		return err
	}

	entity.Name = name
	entity.Location = location
	entity.CostPerSection = costPerSection
	entity.MinutePerSection = minutePerSection

	err := s.db.Save(&entity).Error

	log.Printf("Error saving sport center: %v", err)

	return err
}

func (s *SportCenterService) GetOptions() ([]dto.SelectOption, error) {
	sportCenters, err := s.getSportCenters()
	if err != nil {
		return nil, err
	}
	s.logger.Debug(sportCenters)

	result := lo.Map(sportCenters, func(item domain.SportCenter, _ int) dto.SelectOption {
		return dto.SelectOption{
			Value: strconv.Itoa(int(item.ID)),
			Label: item.Name,
		}
	})
	return result, nil
}

func (s *SportCenterService) getSportCenters() ([]domain.SportCenter, error) {
	var sportCenters []domain.SportCenter
	err := s.db.Order("name ASC").Find(&sportCenters).Error
	return sportCenters, err
}
