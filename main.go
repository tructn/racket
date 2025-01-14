package main

import (
	"net/url"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tructn/racket/internal/di"
	"github.com/tructn/racket/internal/handler"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	adapter "github.com/gwatts/gin-adapter"
)

func main() {
	godotenv.Load()

	container := di.Register()

	app := gin.Default()

	app.Use(cors.New(cors.Config{
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

	app.GET("/health", func(ctx *gin.Context) {
		ctx.JSON(200, gin.H{
			"message": "ok",
		})
	})

	public := app.Group("/api/v1/public")
	container.Invoke(func(handler *handler.ReportingHandler) {
		public.GET("/reports/unpaid", handler.GetUnpaidReportForPublic)
	})

	issuerURL, _ := url.Parse(os.Getenv("AUTH0_ISSUER_URL"))
	audience := os.Getenv("AUTH0_AUDIENCE")
	provider := jwks.NewCachingProvider(issuerURL, time.Duration(5*time.Minute))

	jwtValidator, _ := validator.New(provider.KeyFunc,
		validator.RS256,
		issuerURL.String(),
		[]string{audience},
	)

	jwtMiddleware := jwtmiddleware.New(jwtValidator.ValidateToken)
	app.Use(adapter.Wrap(jwtMiddleware.CheckJWT))

	app.GET("/health/origins", func(ctx *gin.Context) {
		ctx.JSON(200, ctx.Request.Header.Get("Origin"))
	})

	v1 := app.Group("/api/v1")

	container.Invoke(func(handler *handler.MatchHandler) {
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

	container.Invoke(func(handler *handler.PlayerHandler) {
		v1.GET("/players", handler.GetAll)
		v1.GET("/players/external-users/:externalUserId/attendant-requests", handler.GetExternalUserAttendantRequests)
		v1.POST("/players", handler.Create)
		v1.DELETE("/players/:playerId", handler.Delete)
		v1.PUT("/players/:playerId", handler.Update)
		v1.PUT("/players/:playerId/outstanding-payments/paid", handler.MarkOutstandingPaymentsAsPaid)
		v1.POST("/players/:playerId/accounts", handler.OpenAccount)
	})

	container.Invoke(func(handler *handler.RegistrationHandler) {
		v1.GET("/registrations", handler.GetAll)
		v1.POST("/registrations", handler.Register)
		v1.POST("/registrations/attendant-requests", handler.AttendantRequest)
		v1.PUT("/registrations/:registrationId/paid", handler.MarkPaid)
		v1.PUT("/registrations/:registrationId/unpaid", handler.MarkUnPaid)
		v1.DELETE("/registrations/:registrationId", handler.Unregister)
	})

	container.Invoke(func(handler *handler.SportCenterHandler) {
		v1.GET("/sportcenters", handler.GetAll)
		v1.GET("/sportcenters/options", handler.GetOptions)
		v1.POST("/sportcenters", handler.Create)
		v1.PUT("/sportcenters/:sportCenterId", handler.Update)
	})

	container.Invoke(func(handler *handler.SettingsHandler) {
		v1.GET("/settings/message-template", handler.GetMessageTemplate)
		v1.POST("/settings/message-template", handler.CreateMessageTemplate)
	})

	container.Invoke(func(handler *handler.ReportingHandler) {
		v1.GET("/reports/unpaid", handler.GetUnpaidReport)
	})

	container.Invoke(func(handler *handler.ActivityHandler) {
		v1.GET("/activities", handler.GetAll)
	})

	container.Invoke(func(handler *handler.ShareCodeHandler) {
		v1.GET("/share-codes/urls", handler.GetShareUrls)
		v1.POST("/share-codes/urls", handler.CreateShareUrl)
		v1.DELETE("/share-codes/urls/:shareCodeId", handler.DeleteShareCodeUrl)
	})

	app.Run()
}
