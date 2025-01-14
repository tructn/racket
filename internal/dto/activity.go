package dto

import (
	"time"

	"github.com/tructn/racket/internal/domain"
)

type ActivityDto struct {
	TypeId      domain.ActivityType `json:"typeId"`
	TypeName    string              `json:"typeName"`
	Description string              `json:"description"`
	Payload     string              `json:"payload"`
	CreatedDate time.Time           `json:"createdDate"`
}
