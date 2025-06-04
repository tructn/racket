package middleware

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	jwtmiddleware "github.com/auth0/go-jwt-middleware/v2"
	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/gin-gonic/gin"
)

type CustomClaims struct {
	Scope string   `json:"scope"`
	Roles []string `json:"https://auth.tn.co.uk/roles"`
}

func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

func (c CustomClaims) HasScope(expectedScope string) bool {
	result := strings.Split(c.Scope, " ")
	for i := range result {
		if result[i] == expectedScope {
			return true
		}
	}

	return false
}

func (c CustomClaims) IsAdmin() bool {
	for _, role := range c.Roles {
		if role == "admin" {
			return true
		}
	}
	return false
}

func AuthRequired() gin.HandlerFunc {
	domain := os.Getenv("AUTH0_DOMAIN")
	audience := os.Getenv("AUTH0_AUDIENCE")
	issuer, err := url.Parse("https://" + domain + "/")

	if err != nil {
		log.Fatalf("Failed to parse the issuer url: %v", err)
	}

	provider := jwks.NewCachingProvider(issuer, 5*time.Minute)

	jwtValidator, err := validator.New(
		provider.KeyFunc,
		validator.RS256,
		issuer.String(),
		[]string{audience},
		validator.WithCustomClaims(
			func() validator.CustomClaims {
				return &CustomClaims{}
			},
		),
		validator.WithAllowedClockSkew(time.Minute),
	)
	if err != nil {
		log.Fatalf("Failed to set up the jwt validator")
	}

	errorHandler := func(w http.ResponseWriter, r *http.Request, err error) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"message":"Failed to validate JWT."}`))
	}

	middleware := jwtmiddleware.New(
		jwtValidator.ValidateToken,
		jwtmiddleware.WithErrorHandler(errorHandler),
	)

	return func(c *gin.Context) {
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			for k, v := range c.Request.Header {
				r.Header[k] = v
			}

			middleware.CheckJWT(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				authHeader := r.Header.Get("Authorization")
				if authHeader == "" {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No authorization header"})
					return
				}

				token, err := jwtValidator.ValidateToken(r.Context(), strings.TrimPrefix(authHeader, "Bearer "))
				if err != nil {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
					return
				}

				validatedClaims, ok := token.(*validator.ValidatedClaims)
				if !ok {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
					return
				}

				customClaims, ok := validatedClaims.CustomClaims.(*CustomClaims)
				if !ok {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid custom claims"})
					return
				}

				c.Set("idp_user", map[string]interface{}{
					"sub": validatedClaims.RegisteredClaims.Subject,
				})
				c.Set("idp_user_roles", customClaims.Roles)
				c.Set("idp_user_id", validatedClaims.RegisteredClaims.Subject)

				c.Next()
			})).ServeHTTP(w, r)
		})

		handler.ServeHTTP(c.Writer, c.Request)
	}
}
