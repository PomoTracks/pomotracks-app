package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pomotracks-app/backend/storage"
)

var db *mongo.Database

func main() {
	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://pomouser:pomopassword@mongo:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(ctx)

	db = client.Database("pomotracks")

	// Create Gin router
	r := gin.Default()

	// Configure CORS
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	r.Use(cors.New(config))

	// Health check endpoint
	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	// Topics endpoints
	r.GET("/api/v1/topics", func(c *gin.Context) {
		topics, err := storage.GetTopics(db)
		if err != nil {
			log.Println("GetTopics error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, topics)
	})

	r.POST("/api/v1/topics", func(c *gin.Context) {
		var topic storage.Topic
		if err := c.ShouldBindJSON(&topic); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := storage.CreateTopic(db, topic)
		if err != nil {
			log.Println("CreateTopic error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, topic)
	})

	// Sessions endpoint
	r.POST("/api/v1/sessions", func(c *gin.Context) {
		var payload struct {
			TopicID         string `json:"topicId"`
			DurationSeconds int    `json:"durationSeconds"`
		}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		objectID, err := primitive.ObjectIDFromHex(payload.TopicID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid topicId"})
			return
		}

		session := storage.Session{
			TopicID:         objectID,
			DurationSeconds: payload.DurationSeconds,
		}

		if err := storage.CreateSession(db, session); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, session)
	})

	// Handler for aggregated progress
	getProgressHandler := func(c *gin.Context) {
		results, err := storage.GetAggregatedProgress(db)
		if err != nil {
			log.Println("GetAggregatedProgress error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, results)
	}

	// Progress endpoint
	r.GET("/api/v1/progress", getProgressHandler)

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
