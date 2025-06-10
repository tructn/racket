package wallet

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/tructn/racket/internal/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type WalletHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewWalletHandler(db *gorm.DB, logger *zap.SugaredLogger) *WalletHandler {
	return &WalletHandler{
		db:     db,
		logger: logger,
	}
}

func (h *WalletHandler) GetAll(c *gin.Context) {
	var wallets []domain.Wallet
	if err := h.db.Preload("Owner").Find(&wallets).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(400, gin.H{"error": "No wallets found"})
			return
		}
		c.AbortWithError(500, err)
		return
	}

	result := lo.Map(wallets, func(w domain.Wallet, index int) walletDto {
		return walletDto{
			Id:        w.ID,
			Name:      w.Name,
			OwnerId:   w.Owner.ID,
			OwnerName: fmt.Sprintf("%s %s", w.Owner.FirstName, w.Owner.LastName),
			Balance:   w.Balance,
		}
	})

	c.JSON(200, result)
}

func (h *WalletHandler) Create(c *gin.Context) {
	var dto createWalletDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.AbortWithError(400, err)
		return
	}

	var exists bool
	if err := h.db.Find(&domain.Wallet{}, "owner_id = ?", dto.OwnerId).Select("count(1) > 0").Scan(&exists).Error; err != nil {
		h.logger.Errorw("Failed to check if wallet exists", "error", err)
		c.AbortWithError(500, err)
		return
	}

	if exists {
		c.JSON(400, gin.H{"error": "Wallet already exists for this owner"})
		return
	}

	wallet := domain.NewWallet(dto.OwnerId, dto.Name)
	if err := h.db.Create(&wallet).Error; err != nil {
		h.logger.Errorw("Failed to create wallet", "error", err)
		c.AbortWithError(500, err)
		return
	}

	h.logger.Infow("Wallet created successfully", "walletId", wallet.ID, "ownerId", dto.OwnerId)

	c.JSON(201, gin.H{"walletId": wallet.ID})
}

func (h *WalletHandler) Update(c *gin.Context) {
	// Implementation for updating an existing wallet
	c.JSON(200, gin.H{"message": "Update an existing wallet"})
}

func (h *WalletHandler) Delete(c *gin.Context) {
	// Implementation for deleting a wallet
	c.JSON(200, gin.H{"message": "Delete a wallet"})
}
