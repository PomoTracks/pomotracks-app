package storage

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Topic represents a topic in the system
type Topic struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name string             `bson:"name" json:"name"`
	Type string             `bson:"type" json:"type"`
}

// CreateTopic creates a new topic in the database
func CreateTopic(db *mongo.Database, topic Topic) (*mongo.InsertOneResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection("topics")
	return collection.InsertOne(ctx, topic)
}

// GetTopics retrieves all topics from the database
func GetTopics(db *mongo.Database) ([]Topic, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := db.Collection("topics")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var topics []Topic
	if err = cursor.All(ctx, &topics); err != nil {
		return nil, err
	}

	return topics, nil
}
