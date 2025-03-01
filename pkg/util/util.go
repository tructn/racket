package util

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetRouteString(c *gin.Context, p string) string {
	res, _ := c.Params.Get(p)
	return res
}

func GetQueryString(c *gin.Context, p string) string {
	res := c.DefaultQuery(p, "")
	return res
}

func GetIntRouteParam(c *gin.Context, p string) uint {
	str, _ := c.Params.Get(p)
	u64, _ := strconv.ParseUint(str, 10, 32)
	return uint(u64)
}
