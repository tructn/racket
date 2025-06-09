package domain

import (
	"time"

	"gorm.io/gorm"
)

type (
	BaseModel struct {
		*gorm.Model
		ID          uint           `gorm:"primarykey" json:"id"`
		CreatedByID string         `json:"createdById" gorm:"index"`
		UpdatedByID *string        `json:"updatedById" gorm:"index"`
		CreatedAt   time.Time      `json:"createdAt" gorm:"autoCreateTime"`
		UpdatedAt   time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
		DeletedAt   gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	}
)

func (b *BaseModel) BeforeCreate(tx *gorm.DB) (err error) {
	if userId, ok := tx.Statement.Context.Value("user_id").(string); ok {
		b.CreatedByID = userId
	}
	return
}

func (b *BaseModel) BeforeUpdate(tx *gorm.DB) (err error) {
	if userId, ok := tx.Statement.Context.Value("user_id").(string); ok {
		b.UpdatedByID = &userId
	}
	return
}
