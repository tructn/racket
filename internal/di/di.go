package di

import (
	"github.com/tructn/racket/internal/db"
	"github.com/tructn/racket/internal/handler"
	"github.com/tructn/racket/internal/service"
	"github.com/tructn/racket/pkg/logger"
	"go.uber.org/dig"
)

func Register() *dig.Container {
	c := dig.New()

	// Infra
	c.Provide(db.NewDatabase)
	c.Provide(logger.NewLogger)

	// Handlers
	c.Provide(handler.NewMatchHandler)
	c.Provide(handler.NewPlayerHandler)
	c.Provide(handler.NewRegHandler)
	c.Provide(handler.NewSportCenterHandler)
	c.Provide(handler.NewSettingsHandler)
	c.Provide(handler.NewReportHandler)
	c.Provide(handler.NewActivityHandler)
	c.Provide(handler.NewShareCodeHandler)
	c.Provide(handler.NewTeamHandler)
	c.Provide(handler.NewUserHandler)

	// Services
	c.Provide(service.NewSportCenterService)
	c.Provide(service.NewPaymentService)
	c.Provide(service.NewMatchService)
	c.Provide(service.NewPlayerService)
	c.Provide(service.NewActivityService)
	c.Provide(service.NewUserService)
	c.Provide(service.NewTeamService)
	c.Provide(service.NewUserService)

	return c
}
