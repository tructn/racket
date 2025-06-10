package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tructn/racket/internal/di"
	"github.com/tructn/racket/internal/feature/wallet"
	"github.com/tructn/racket/internal/handler"
	"github.com/tructn/racket/pkg/middleware"
)

func main() {
	godotenv.Load(".env")
	PORT := os.Getenv("PORT")

	if PORT == "" {
		PORT = "8000"
	}

	reg := di.Register()
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
			"https://getracket.vercel.app",
		},
		AllowMethods:     []string{"PUT", "POST", "GET", "DELETE", "PATCH"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	router.GET("/health", func(ctx *gin.Context) {
		ctx.Status(200)
	})

	anonymousApi := router.Group("/api/v1")
	reg.Invoke(func(anonymousHandler *handler.AnonymousHandler) {
		anonymousHandler.UseRouter(anonymousApi)
	})

	api := router.Group("/api/v1")
	api.Use(middleware.AuthRequired())

	reg.Invoke(func(handler *handler.MatchHandler) {
		api.POST("/matches", handler.Create)
		api.GET("/matches", handler.GetAll)
		api.GET("/matches/archived", handler.GetArchivedMatches)
		api.GET("/matches/future", handler.GetFutureMatches)
		api.GET("/matches/today", handler.GetTodayMatches)
		api.GET("/upcoming-matches", handler.GetUpcomingMatches)
		api.GET("/matches/:matchId/registrations", handler.GetRegistrationsByMatch)
		api.GET("/matches/:matchId/cost", handler.GetCost)
		api.POST("/matches/:matchId/clone", handler.Clone)
		api.GET("/matches/:matchId/additional-costs", handler.GetAdditionalCost)
		api.PUT("/matches/:matchId", handler.UpdateMatch)
		api.PUT("/matches/:matchId/costs", handler.UpdateCost)
		api.PUT("/matches/:matchId/additional-costs", handler.CreateAdditionalCost)
		api.DELETE("/matches/:matchId", handler.Delete)
	})

	reg.Invoke(func(handler *handler.PlayerHandler) {
		api.GET("/players", handler.GetAll)
		api.GET("/players/external-users/:externalUserId/attendant-requests", handler.GetExternalUserAttendantRequests)
		api.POST("/players", handler.Create)
		api.DELETE("/players/:playerId", handler.Delete)
		api.PUT("/players/:playerId", handler.Update)
		api.PUT("/players/:playerId/outstanding-payments/paid", handler.MarkOutstandingPaymentsAsPaid)
	})

	reg.Invoke(func(handler *handler.SportCenterHandler) {
		api.GET("/sportcenters", handler.GetAll)
		api.GET("/sportcenters/options", handler.GetOptions)
		api.POST("/sportcenters", handler.Create)
		api.PUT("/sportcenters/:sportCenterId", handler.Update)
	})

	reg.Invoke(func(handler *handler.SettingsHandler) {
		api.GET("/settings/message-template", handler.GetMessageTemplate)
		api.POST("/settings/message-template", handler.CreateMessageTemplate)
	})

	reg.Invoke(func(handler *handler.ActivityHandler) {
		api.GET("/activities", handler.GetAll)
	})

	reg.Invoke(func(handler *handler.ShareCodeHandler) {
		api.GET("/share-codes/urls", handler.GetShareUrls)
		api.POST("/share-codes/urls", handler.CreateShareUrl)
		api.DELETE("/share-codes/urls/:shareCodeId", handler.DeleteShareCodeUrl)
	})

	reg.Invoke(func(
		teamHandler *handler.TeamHandler,
		userHandler *handler.UserHandler,
		registrationHandler *handler.RegistrationHandler,
		meHandler *handler.MeHandler,
		reportHandler *handler.ReportHandler,
		walletHandler *wallet.WalletHandler,
	) {
		registrationHandler.UseRouter(api)
		teamHandler.UseRouter(api)
		userHandler.UseRouter(api)
		meHandler.UseRouter(api)
		reportHandler.UseRouter(api)
		walletHandler.UseRouter(api)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", PORT),
		Handler: router.Handler(),
	}

	// Serve HTTP server in goroutine
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server with
	// a timeout of 5 seconds.
	// Channel to listen for OS signals
	quit := make(chan os.Signal, 1)

	// kill (no param) default send syscall.SIGTERM
	// kill -2 is syscall.SIGINT
	// kill -9 is syscall.SIGKILL but can"t be catch, so don't need add it
	// Catch Ctrl + C or kill -15
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Block until signal is receveid
	<-quit
	log.Println("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server Shutdown:", err)
	}
}
