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

	publicV1 := router.Group("/api/v1/public")
	reg.Invoke(func(handler *handler.ReportHandler) {
		publicV1.GET("/reports/unpaid", handler.GetUnpaidReportForPublic)
	})

	publicV2 := router.Group("/api/v2/public")
	reg.Invoke(func(handler *handler.ReportHandler) {
		publicV2.GET("/reports/unpaid", handler.GetUnpaidDetailsByPlayer)
	})

	apiV1 := router.Group("/api/v1")
	apiV1.Use(middleware.AuthRequired())

	reg.Invoke(func(handler *handler.MatchHandler) {
		apiV1.POST("/matches", handler.Create)
		apiV1.GET("/matches", handler.GetAll)
		apiV1.GET("/matches/archived", handler.GetArchivedMatches)
		apiV1.GET("/matches/future", handler.GetFutureMatches)
		apiV1.GET("/matches/today", handler.GetTodayMatches)
		apiV1.GET("/upcoming-matches", handler.GetUpcomingMatches)
		apiV1.GET("/matches/:matchId/registrations", handler.GetRegistrationsByMatch)
		apiV1.GET("/matches/:matchId/cost", handler.GetCost)
		apiV1.POST("/matches/:matchId/clone", handler.Clone)
		apiV1.GET("/matches/:matchId/additional-costs", handler.GetAdditionalCost)
		apiV1.PUT("/matches/:matchId", handler.UpdateMatch)
		apiV1.PUT("/matches/:matchId/costs", handler.UpdateCost)
		apiV1.PUT("/matches/:matchId/additional-costs", handler.CreateAdditionalCost)
		apiV1.DELETE("/matches/:matchId", handler.Delete)
	})

	reg.Invoke(func(handler *handler.PlayerHandler) {
		apiV1.GET("/players", handler.GetAll)
		apiV1.GET("/players/external-users/:externalUserId/attendant-requests", handler.GetExternalUserAttendantRequests)
		apiV1.POST("/players", handler.Create)
		apiV1.DELETE("/players/:playerId", handler.Delete)
		apiV1.PUT("/players/:playerId", handler.Update)
		apiV1.PUT("/players/:playerId/outstanding-payments/paid", handler.MarkOutstandingPaymentsAsPaid)
		apiV1.POST("/players/:playerId/accounts", handler.OpenAccount)
	})

	reg.Invoke(func(handler *handler.SportCenterHandler) {
		apiV1.GET("/sportcenters", handler.GetAll)
		apiV1.GET("/sportcenters/options", handler.GetOptions)
		apiV1.POST("/sportcenters", handler.Create)
		apiV1.PUT("/sportcenters/:sportCenterId", handler.Update)
	})

	reg.Invoke(func(handler *handler.SettingsHandler) {
		apiV1.GET("/settings/message-template", handler.GetMessageTemplate)
		apiV1.POST("/settings/message-template", handler.CreateMessageTemplate)
	})

	reg.Invoke(func(handler *handler.ReportHandler) {
		apiV1.GET("/reports/unpaid", handler.GetUnpaidReport)
	})

	reg.Invoke(func(handler *handler.ActivityHandler) {
		apiV1.GET("/activities", handler.GetAll)
	})

	reg.Invoke(func(handler *handler.ShareCodeHandler) {
		apiV1.GET("/share-codes/urls", handler.GetShareUrls)
		apiV1.POST("/share-codes/urls", handler.CreateShareUrl)
		apiV1.DELETE("/share-codes/urls/:shareCodeId", handler.DeleteShareCodeUrl)
	})

	reg.Invoke(func(
		teamHandler *handler.TeamHandler,
		userHandler *handler.UserHandler,
		registrationHandler *handler.RegistrationHandler,
		meHandler *handler.MeHandler,
	) {
		registrationHandler.UseRouter(apiV1)
		teamHandler.UseRouter(apiV1)
		userHandler.UseRouter(apiV1)
		meHandler.UseRouter(apiV1)
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
