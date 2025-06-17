package storage

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Session struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TopicID         primitive.ObjectID `bson:"topicId" json:"topicId"`
	DurationSeconds int                `bson:"durationSeconds" json:"durationSeconds"`
	CompletedAt     time.Time          `bson:"completedAt" json:"completedAt"`
}

// ProgressResult represents aggregated progress per topic
type ProgressResult struct {
	TopicName    string  `bson:"topicName" json:"topicName"`
	TotalMinutes float64 `bson:"totalMinutes" json:"totalMinutes"`
}

// GetAggregatedProgress returns total minutes per topic using MongoDB aggregation
func GetAggregatedProgress(db *mongo.Database) ([]ProgressResult, error) {
	ctx := context.Background()
	collection := db.Collection("sessions")

	// First, let's check what sessions we have
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("Error finding sessions: %v", err)
		return nil, err
	}
	var allSessions []bson.M
	if err := cursor.All(ctx, &allSessions); err != nil {
		log.Printf("Error decoding sessions: %v", err)
		return nil, err
	}
	log.Printf("Found %d sessions in database: %+v", len(allSessions), allSessions)

	pipeline := mongo.Pipeline{
		// First, ensure we only look at sessions with valid topicIds
		bson.D{{"$match", bson.D{
			{"topicId", bson.M{"$exists": true, "$ne": nil}},
		}}},
		// Group by topicId and sum durationSeconds
		bson.D{{"$group", bson.D{
			{"_id", "$topicId"},
			{"totaldurationseconds", bson.M{"$sum": "$durationSeconds"}},
		}}},
		// Lookup topic details
		bson.D{{"$lookup", bson.D{
			{"from", "topics"},
			{"localField", "_id"},
			{"foreignField", "_id"},
			{"as", "topicDetails"},
		}}},
		// Unwind the topicDetails array
		bson.D{{"$unwind", "$topicDetails"}},
		// Project the final result
		bson.D{{"$project", bson.D{
			{"_id", 0},
			{"topicName", "$topicDetails.name"},
			{"totalMinutes", bson.M{"$round": bson.M{"$divide": bson.A{"$totaldurationseconds", 60}}}},
		}}},
		// Sort by totalMinutes in descending order
		bson.D{{"$sort", bson.D{
			{"totalMinutes", -1},
		}}},
	}

	// Log the pipeline for debugging
	log.Printf("Using aggregation pipeline: %+v", pipeline)

	cursor, err = collection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("Error in aggregation: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []ProgressResult
	if err := cursor.All(ctx, &results); err != nil {
		log.Printf("Error decoding results: %v", err)
		return nil, err
	}

	// Log the results for debugging
	log.Printf("Aggregation results: %+v", results)

	return results, nil
}

func CreateSession(db *mongo.Database, session Session) error {
	ctx := context.Background()
	collection := db.Collection("sessions")

	// Log the session data for debugging
	log.Printf("Creating session with topicId: %v, duration: %d seconds", session.TopicID, session.DurationSeconds)

	// Create the session document with explicit field names
	sessionDoc := bson.M{
		"topicId":         session.TopicID,
		"durationSeconds": session.DurationSeconds,
		"createdAt":       time.Now(),
	}

	// Log the document we're about to insert
	log.Printf("Inserting session document: %+v", sessionDoc)

	result, err := collection.InsertOne(ctx, sessionDoc)
	if err != nil {
		log.Printf("Error creating session: %v", err)
		return fmt.Errorf("failed to create session: %v", err)
	}

	// Verify the insertion
	var insertedDoc bson.M
	err = collection.FindOne(ctx, bson.M{"_id": result.InsertedID}).Decode(&insertedDoc)
	if err != nil {
		log.Printf("Error verifying session creation: %v", err)
		return fmt.Errorf("session created but verification failed: %v", err)
	}

	log.Printf("Successfully created and verified session with ID: %v", result.InsertedID)
	return nil
}
