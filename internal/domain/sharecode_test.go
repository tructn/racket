package domain

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type mockGenerator struct{}

func (g *mockGenerator) Gen(length int) (string, error) {
	return "fake-share-code", nil
}

func TestCreateShareCodeWithUrl(t *testing.T) {
	mockGen := &mockGenerator{}
	a := NewShareCodeWithUrl("https://fake.com", mockGen)
	assert.Equal(t, "https://fake.com", a.Url)
	assert.Equal(t, "fake-share-code", a.Code)
	assert.Equal(t, "https://fake.com?share-code=fake-share-code", a.FullUrl)
	assert.WithinDuration(t, time.Now().UTC().Add(time.Hour*24), a.ExpiredAt, time.Hour, "ExpiredAt should be 24 hours from now")
}

func TestCreateShareCodeWithNoUrl(t *testing.T) {
	mockGen := &mockGenerator{}
	a := NewShareCode(mockGen)
	assert.WithinDuration(t, time.Now().UTC().Add(time.Hour*24), a.ExpiredAt, time.Hour, "ExpiredAt should be 24 hours from now")
	assert.Equal(t, "fake-share-code", a.Code)
}

func TestValidateUrlWithCode(t *testing.T) {
	mockGen := &mockGenerator{}
	a := NewShareCode(mockGen)
	b := a.ValidateCode("fake-share-code")
	assert.True(t, b)
	c := a.ValidateCode("a")
	assert.False(t, c)
}
