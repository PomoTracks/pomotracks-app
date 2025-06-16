package storage

import (
	"context"
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
	TopicName    string  `json:"TopicName" bson:"TopicName"`
	TotalMinutes float64 `json:"TotalMinutes" bson:"TotalMinutes"`
}

// GetAggregatedProgress returns total minutes per topic using MongoDB aggregation
func GetAggregatedProgress(db *mongo.Database) ([]ProgressResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		// Group by topicId and sum durationSeconds
		{
			{"$group", bson.D{
				{"_id", "$topicId"},
				{"totalSeconds", bson.D{{"$sum", "$durationSeconds"}}},
			}},
		},
		// Lookup topic details
		{
			{"$lookup", bson.D{
				{"from", "topics"},
				{"localField", "_id"},
				{"foreignField", "_id"},
				{"as", "topic"},
			}},
		},
		// Unwind topic array
		{
			{"$unwind", "$topic"},
		},
		// Project to ProgressResult
		{
			{"$project", bson.D{
				{"TopicName", "$topic.name"},
				{"TotalMinutes", bson.D{{"$divide", bson.A{"$totalSeconds", 60}}}},
			}},
		},
	}

	collection := db.Collection("sessions")
	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []ProgressResult
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

func CreateSession(db *mongo.Database, session Session) error {
	collection := db.Collection("sessions")

	// Set the completed time to now
	session.CompletedAt = time.Now()

	_, err := collection.InsertOne(context.Background(), session)
	return err
}
