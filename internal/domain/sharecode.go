package domain

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"time"
)

type ShareCode struct {
	BaseModel
	Code      string    `json:"code"`
	ExpiredAt time.Time `json:"expiredAt"`
	Url       string    `json:"url"`
	FullUrl   string    `json:"fullUrl"`
}

type Generator interface {
	Gen(length int) (string, error)
}

type DefaultGenerator struct{}

func (g *DefaultGenerator) Gen(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(bytes), nil
}

func createExpiry() time.Time {
	return time.Now().UTC().Add(time.Hour * 24)
}

func NewShareCode(generator Generator) *ShareCode {
	code, _ := generator.Gen(20)
	expiry := createExpiry()
	return &ShareCode{
		Code:      code,
		ExpiredAt: expiry,
	}
}

func NewShareCodeWithUrl(url string, generator Generator) *ShareCode {
	code, _ := generator.Gen(20)
	fullUrl := fmt.Sprintf("%s/v2?share-code=%s", url, code)
	expiry := createExpiry()

	return &ShareCode{
		Code:      code,
		ExpiredAt: expiry,
		Url:       url,
		FullUrl:   fullUrl,
	}
}

func (sc *ShareCode) ValidateCode(code string) bool {
	return sc.Code == code
}

func (sc *ShareCode) ValidateUrlWithCode(url, code string) bool {
	return sc.Url == url && sc.Code == code
}
