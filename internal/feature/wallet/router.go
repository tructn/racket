package wallet

import "github.com/gin-gonic/gin"

func (h *WalletHandler) UseRouter(router *gin.RouterGroup) {
	group := router.Group("/wallets")
	{
		group.GET("", h.GetAll)
		group.POST("", h.Create)
		group.PUT("/:walletId", h.Update)
		group.DELETE("/:walletId", h.Delete)
	}
}
