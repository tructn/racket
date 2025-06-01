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
	godotenv.Load()

	port := os.Getenv("PORT")

	if port == "" {
		port = "8000"
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

	v1RouterGroup := router.Group("/api/v1")
	v1RouterGroup.Use(middleware.AuthRequired())

	reg.Invoke(func(handler *handler.MatchHandler) {
		v1RouterGroup.POST("/matches", handler.Create)
		v1RouterGroup.GET("/matches", handler.GetAll)
		v1RouterGroup.GET("/matches/archived", handler.GetArchivedMatches)
		v1RouterGroup.GET("/matches/future", handler.GetFutureMatches)
		v1RouterGroup.GET("/matches/today", handler.GetTodayMatches)
		v1RouterGroup.GET("/upcoming-matches", handler.GetUpcomingMatches)
		v1RouterGroup.GET("/matches/:matchId/registrations", handler.GetRegistrationsByMatch)
		v1RouterGroup.GET("/matches/:matchId/cost", handler.GetCost)
		v1RouterGroup.POST("/matches/:matchId/clone", handler.Clone)
		v1RouterGroup.GET("/matches/:matchId/additional-costs", handler.GetAdditionalCost)
		v1RouterGroup.PUT("/matches/:matchId", handler.UpdateMatch)
		v1RouterGroup.PUT("/matches/:matchId/costs", handler.UpdateCost)
		v1RouterGroup.PUT("/matches/:matchId/additional-costs", handler.CreateAdditionalCost)
		v1RouterGroup.DELETE("/matches/:matchId", handler.Delete)
	})

	reg.Invoke(func(handler *handler.PlayerHandler) {
		v1RouterGroup.GET("/players", handler.GetAll)
		v1RouterGroup.GET("/players/external-users/:externalUserId/attendant-requests", handler.GetExternalUserAttendantRequests)
		v1RouterGroup.POST("/players", handler.Create)
		v1RouterGroup.DELETE("/players/:playerId", handler.Delete)
		v1RouterGroup.PUT("/players/:playerId", handler.Update)
		v1RouterGroup.PUT("/players/:playerId/outstanding-payments/paid", handler.MarkOutstandingPaymentsAsPaid)
		v1RouterGroup.POST("/players/:playerId/accounts", handler.OpenAccount)
	})

	reg.Invoke(func(handler *handler.RegistrationHandler) {
		v1RouterGroup.GET("/registrations", handler.GetAll)
		v1RouterGroup.POST("/registrations", handler.Register)
		v1RouterGroup.POST("/registrations/attendant-requests", handler.AttendantRequest)
		v1RouterGroup.PUT("/registrations/:registrationId/paid", handler.MarkPaid)
		v1RouterGroup.PUT("/registrations/:registrationId/unpaid", handler.MarkUnPaid)
		v1RouterGroup.DELETE("/registrations/:registrationId", handler.Unregister)
	})

	reg.Invoke(func(handler *handler.SportCenterHandler) {
		v1RouterGroup.GET("/sportcenters", handler.GetAll)
		v1RouterGroup.GET("/sportcenters/options", handler.GetOptions)
		v1RouterGroup.POST("/sportcenters", handler.Create)
		v1RouterGroup.PUT("/sportcenters/:sportCenterId", handler.Update)
	})

	reg.Invoke(func(handler *handler.SettingsHandler) {
		v1RouterGroup.GET("/settings/message-template", handler.GetMessageTemplate)
		v1RouterGroup.POST("/settings/message-template", handler.CreateMessageTemplate)
	})

	reg.Invoke(func(handler *handler.ReportHandler) {
		v1RouterGroup.GET("/reports/unpaid", handler.GetUnpaidReport)
	})

	reg.Invoke(func(handler *handler.ActivityHandler) {
		v1RouterGroup.GET("/activities", handler.GetAll)
	})

	reg.Invoke(func(handler *handler.ShareCodeHandler) {
		v1RouterGroup.GET("/share-codes/urls", handler.GetShareUrls)
		v1RouterGroup.POST("/share-codes/urls", handler.CreateShareUrl)
		v1RouterGroup.DELETE("/share-codes/urls/:shareCodeId", handler.DeleteShareCodeUrl)
	})

	reg.Invoke(func(handler *handler.TeamHandler) {
		handler.RegisterTeamRouters(v1RouterGroup)
	})

	reg.Invoke(func(handler *handler.UserHandler) {
		v1RouterGroup.GET("/users/me", handler.GetCurrentUser)
		v1RouterGroup.PUT("/users/me", handler.UpdateProfile)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", port),
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
