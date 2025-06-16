package main

import (
	"log"
	"net/http"

	"github.com/PomoTracks/pomotracks-app/backend/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func createTopicHandler(c *gin.Context) {
	var topic storage.Topic
	if err := c.ShouldBindJSON(&topic); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := storage.CreateTopic(topic)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func listTopicsHandler(c *gin.Context) {
	topics, err := storage.ListTopics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, topics)
}

func main() {
	// Initialize database connection
	if err := storage.Init(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create a new Gin router
	router := gin.Default()

	// Enable CORS
	router.Use(cors.Default())

	// Define API routes
	api := router.Group("/api/v1")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
			})
		})

		// Topic endpoints
		api.POST("/topics", createTopicHandler)
		api.GET("/topics", listTopicsHandler)
	}

	// Start the server on port 8080
	router.Run(":8080")
}
