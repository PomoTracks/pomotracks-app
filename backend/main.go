package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
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
			log.Printf("Invalid session payload: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		log.Printf("Received session creation request: %+v", payload)

		if payload.DurationSeconds <= 0 {
			log.Printf("Invalid duration: %d", payload.DurationSeconds)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Duration must be greater than 0"})
			return
		}

		objectID, err := primitive.ObjectIDFromHex(payload.TopicID)
		if err != nil {
			log.Printf("Invalid topicId format: %s", payload.TopicID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid topicId format"})
			return
		}

		// Verify topic exists
		var topic storage.Topic
		err = db.Collection("topics").FindOne(c, bson.M{"_id": objectID}).Decode(&topic)
		if err != nil {
			log.Printf("Topic not found: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Topic not found"})
			return
		}

		session := storage.Session{
			TopicID:         objectID,
			DurationSeconds: payload.DurationSeconds,
		}

		if err := storage.CreateSession(db, session); err != nil {
			log.Printf("Failed to create session: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		log.Printf("Successfully created session for topic: %s", topic.Name)
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

	// Cleanup endpoint (for development only)
	r.POST("/api/v1/cleanup", func(c *gin.Context) {
		collections := []string{"topics", "sessions"}
		for _, collection := range collections {
			if err := db.Collection(collection).Drop(c); err != nil {
				log.Printf("Error dropping collection %s: %v", collection, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to drop collection %s", collection)})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "Database cleared successfully"})
	})

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
