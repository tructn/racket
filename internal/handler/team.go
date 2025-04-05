package handler

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/tructn/racket/internal/domain"
	"github.com/tructn/racket/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type TeamHandler struct {
	db     *gorm.DB
	logger *zap.SugaredLogger
}

func NewTeamHandler(db *gorm.DB, logger *zap.SugaredLogger) *TeamHandler {
	return &TeamHandler{
		db:     db,
		logger: logger,
	}
}

// Create creates a new team
func (h *TeamHandler) Create(c *gin.Context) {
	userID, exists := c.Get("user_id")

	log.Printf("User ID: %v", userID)

	if !exists {
		h.logger.Error("Claims not found in token")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized access"})
		return
	}

	// Parse the request body
	var teamDto dto.TeamCreateDto
	if err := c.ShouldBindJSON(&teamDto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the team
	team := domain.NewTeam(teamDto.Name, teamDto.Description, userID.(string))
	if err := h.db.Create(team).Error; err != nil {
		h.logger.Errorf("Failed to create team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team"})
		return
	}

	// Return the created team
	c.JSON(http.StatusCreated, team)
}

// GetAll returns all teams for the current user
func (h *TeamHandler) GetAll(c *gin.Context) {
	// Get the user ID from the JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	// Get all teams owned by the user
	var teams []domain.Team
	if err := h.db.Where("owner_id = ?", userID).Find(&teams).Error; err != nil {
		h.logger.Errorf("Failed to get teams: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get teams"})
		return
	}

	// Get all teams where the user is a member
	var player domain.Player
	if err := h.db.Where("external_user_id = ?", userID).First(&player).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			h.logger.Errorf("Failed to get player: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player"})
			return
		}
	} else {
		// Get teams where the player is a member
		var memberTeams []domain.Team
		if err := h.db.Model(&player).Association("Teams").Find(&memberTeams); err != nil {
			h.logger.Errorf("Failed to get member teams: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get member teams"})
			return
		}
		teams = append(teams, memberTeams...)
	}

	// Return the teams
	c.JSON(http.StatusOK, teams)
}

// GetByID returns a team by ID
func (h *TeamHandler) GetByID(c *gin.Context) {
	// Get the team ID from the URL
	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	// Get the team
	var team domain.Team
	if err := h.db.Preload("Members").First(&team, teamID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		h.logger.Errorf("Failed to get team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get team"})
		return
	}

	// Return the team
	c.JSON(http.StatusOK, team)
}

// Update updates a team
func (h *TeamHandler) Update(c *gin.Context) {
	// Get the team ID from the URL
	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	// Get the user ID from the JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	// Get the team
	var team domain.Team
	if err := h.db.First(&team, teamID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		h.logger.Errorf("Failed to get team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get team"})
		return
	}

	// Check if the user is the owner of the team
	if team.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the owner of this team"})
		return
	}

	// Parse the request body
	var teamDto dto.TeamUpdateDto
	if err := c.ShouldBindJSON(&teamDto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the team
	if teamDto.Name != "" {
		team.Name = teamDto.Name
	}
	if teamDto.Description != "" {
		team.Description = teamDto.Description
	}
	team.UpdatedAt = time.Now().UTC()

	if err := h.db.Save(&team).Error; err != nil {
		h.logger.Errorf("Failed to update team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update team"})
		return
	}

	// Return the updated team
	c.JSON(http.StatusOK, team)
}

// Delete deletes a team
func (h *TeamHandler) Delete(c *gin.Context) {
	// Get the team ID from the URL
	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	// Get the user ID from the JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	// Get the team
	var team domain.Team
	if err := h.db.First(&team, teamID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		h.logger.Errorf("Failed to get team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get team"})
		return
	}

	// Check if the user is the owner of the team
	if team.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the owner of this team"})
		return
	}

	// Delete the team
	if err := h.db.Delete(&team).Error; err != nil {
		h.logger.Errorf("Failed to delete team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted successfully"})
}

// AddMember adds a member to a team
func (h *TeamHandler) AddMember(c *gin.Context) {
	// Get the team ID from the URL
	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	// Get the user ID from the JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	// Get the team
	var team domain.Team
	if err := h.db.First(&team, teamID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		h.logger.Errorf("Failed to get team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get team"})
		return
	}

	// Check if the user is the owner of the team
	if team.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the owner of this team"})
		return
	}

	// Parse the request body
	var memberDto dto.TeamMemberDto
	if err := c.ShouldBindJSON(&memberDto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get the player
	var player domain.Player
	if err := h.db.First(&player, memberDto.PlayerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		h.logger.Errorf("Failed to get player: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player"})
		return
	}

	// Add the player to the team
	if err := h.db.Model(&team).Association("Members").Append(&player); err != nil {
		h.logger.Errorf("Failed to add member to team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add member to team"})
		return
	}

	// Create the team member relationship
	teamMember := domain.TeamMember{
		TeamID:   uint(teamID),
		PlayerID: memberDto.PlayerID,
		Role:     memberDto.Role,
	}
	if err := h.db.Create(&teamMember).Error; err != nil {
		h.logger.Errorf("Failed to create team member: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create team member"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{"message": "Member added successfully"})
}

// RemoveMember removes a member from a team
func (h *TeamHandler) RemoveMember(c *gin.Context) {
	// Get the team ID from the URL
	teamID, err := strconv.ParseUint(c.Param("teamId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	// Get the player ID from the URL
	playerID, err := strconv.ParseUint(c.Param("playerId"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid player ID"})
		return
	}

	// Get the user ID from the JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
		return
	}

	// Get the team
	var team domain.Team
	if err := h.db.First(&team, teamID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
			return
		}
		h.logger.Errorf("Failed to get team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get team"})
		return
	}

	// Check if the user is the owner of the team
	if team.OwnerID != userID.(string) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the owner of this team"})
		return
	}

	// Get the player
	var player domain.Player
	if err := h.db.First(&player, playerID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Player not found"})
			return
		}
		h.logger.Errorf("Failed to get player: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get player"})
		return
	}

	// Remove the player from the team
	if err := h.db.Model(&team).Association("Members").Delete(&player); err != nil {
		h.logger.Errorf("Failed to remove member from team: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove member from team"})
		return
	}

	// Delete the team member relationship
	if err := h.db.Where("team_id = ? AND player_id = ?", teamID, playerID).Delete(&domain.TeamMember{}).Error; err != nil {
		h.logger.Errorf("Failed to delete team member: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team member"})
		return
	}

	// Return success
	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}
