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

// CustomClaims contains custom data we want from the token.
type CustomClaims struct {
	Scope string   `json:"scope"`
	Roles []string `json:"https://auth.tn.co.uk/roles"`
}

// Validate does nothing for this example, but we need
// it to satisfy validator.CustomClaims interface.
func (c CustomClaims) Validate(ctx context.Context) error {
	return nil
}

// HasScope checks whether our claims have a specific scope.
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
	// WANT TO USE SLICE TO DO THE NAIVE WAY
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
		log.Printf("Encountered error while validating JWT: %v", err)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte(`{"message":"Failed to validate JWT."}`))
	}

	middleware := jwtmiddleware.New(
		jwtValidator.ValidateToken,
		jwtmiddleware.WithErrorHandler(errorHandler),
	)

	return func(c *gin.Context) {
		// Convert Gin context to http.Handler
		handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Copy headers from Gin to http.Request
			for k, v := range c.Request.Header {
				r.Header[k] = v
			}

			// Run JWT validation
			middleware.CheckJWT(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Extract token from Authorization header
				authHeader := r.Header.Get("Authorization")
				if authHeader == "" {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No authorization header"})
					return
				}

				// Remove "Bearer " prefix and parse token
				token, err := jwtValidator.ValidateToken(r.Context(), strings.TrimPrefix(authHeader, "Bearer "))
				if err != nil {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
					return
				}

				// Extract claims
				validatedClaims, ok := token.(*validator.ValidatedClaims)
				if !ok {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
					return
				}

				// Get custom claims
				customClaims, ok := validatedClaims.CustomClaims.(*CustomClaims)
				if !ok {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid custom claims"})
					return
				}

				// Store user ID and roles in Gin context
				c.Set("user_id", validatedClaims.RegisteredClaims.Subject)
				c.Set("user_roles", customClaims.Roles)

				c.Next()
			})).ServeHTTP(w, r)
		})

		handler.ServeHTTP(c.Writer, c.Request)
	}
}
