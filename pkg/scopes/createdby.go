package scopes

import (
	"context"

	"gorm.io/gorm"
)

func UserScope(ctx context.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if userID, ok := ctx.Value("user_id").(int64); ok && userID > 0 {
			return db.Where("created_by_id = ?", userID)
		}
		return db
	}
}
