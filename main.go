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
	reg.Invoke(func(handler *handler.ReportingHandler) {
		publicV1.GET("/reports/unpaid", handler.GetUnpaidReportForPublic)
	})

	publicV2 := router.Group("/api/v2/public")
	reg.Invoke(func(handler *handler.ReportingHandler) {
		publicV2.GET("/reports/unpaid", handler.GetUnpaidReportForPublicV2)
	})

	v1 := router.Group("/api/v1")
	v1.Use(middleware.AuthRequired())

	reg.Invoke(func(handler *handler.MatchHandler) {
		v1.POST("/matches", handler.Create)
		v1.GET("/matches", handler.GetAll)
		v1.GET("/matches/archived", handler.GetArchivedMatches)
		v1.GET("/matches/future", handler.GetFutureMatches)
		v1.GET("/matches/today", handler.GetTodayMatches)
		v1.GET("/upcoming-matches", handler.GetUpcomingMatches)
		v1.GET("/matches/:matchId/registrations", handler.GetRegistrationsByMatch)
		v1.GET("/matches/:matchId/cost", handler.GetCost)
		v1.POST("/matches/:matchId/clone", handler.Clone)
		v1.GET("/matches/:matchId/additional-costs", handler.GetAdditionalCost)
		v1.PUT("/matches/:matchId", handler.UpdateMatch)
		v1.PUT("/matches/:matchId/costs", handler.UpdateCost)
		v1.PUT("/matches/:matchId/additional-costs", handler.CreateAdditionalCost)
		v1.DELETE("/matches/:matchId", handler.Delete)
	})

	reg.Invoke(func(handler *handler.PlayerHandler) {
		v1.GET("/players", handler.GetAll)
		v1.GET("/players/external-users/:externalUserId/attendant-requests", handler.GetExternalUserAttendantRequests)
		v1.POST("/players", handler.Create)
		v1.DELETE("/players/:playerId", handler.Delete)
		v1.PUT("/players/:playerId", handler.Update)
		v1.PUT("/players/:playerId/outstanding-payments/paid", handler.MarkOutstandingPaymentsAsPaid)
		v1.POST("/players/:playerId/accounts", handler.OpenAccount)
	})

	reg.Invoke(func(handler *handler.RegistrationHandler) {
		v1.GET("/registrations", handler.GetAll)
		v1.POST("/registrations", handler.Register)
		v1.POST("/registrations/attendant-requests", handler.AttendantRequest)
		v1.PUT("/registrations/:registrationId/paid", handler.MarkPaid)
		v1.PUT("/registrations/:registrationId/unpaid", handler.MarkUnPaid)
		v1.DELETE("/registrations/:registrationId", handler.Unregister)
	})

	reg.Invoke(func(handler *handler.SportCenterHandler) {
		v1.GET("/sportcenters", handler.GetAll)
		v1.GET("/sportcenters/options", handler.GetOptions)
		v1.POST("/sportcenters", handler.Create)
		v1.PUT("/sportcenters/:sportCenterId", handler.Update)
	})

	reg.Invoke(func(handler *handler.SettingsHandler) {
		v1.GET("/settings/message-template", handler.GetMessageTemplate)
		v1.POST("/settings/message-template", handler.CreateMessageTemplate)
	})

	reg.Invoke(func(handler *handler.ReportingHandler) {
		v1.GET("/reports/unpaid", handler.GetUnpaidReport)
	})

	reg.Invoke(func(handler *handler.ActivityHandler) {
		v1.GET("/activities", handler.GetAll)
	})

	reg.Invoke(func(handler *handler.ShareCodeHandler) {
		v1.GET("/share-codes/urls", handler.GetShareUrls)
		v1.POST("/share-codes/urls", handler.CreateShareUrl)
		v1.DELETE("/share-codes/urls/:shareCodeId", handler.DeleteShareCodeUrl)
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
