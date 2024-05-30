package di

import (
	"github.com/truc9/racket/db"
	"github.com/truc9/racket/handler"
	"github.com/truc9/racket/logger"
	"github.com/truc9/racket/service"
	"go.uber.org/dig"
)

func Register() *dig.Container {
	c := dig.New()

	c.Provide(db.NewDatabase)
	c.Provide(logger.NewLogger)
	c.Provide(handler.NewMatchHandler)
	c.Provide(handler.NewPlayerHandler)
	c.Provide(handler.NewRegHandler)
	c.Provide(handler.NewSportCenterHandler)

	c.Provide(service.NewSportCenterService)

	return c
}