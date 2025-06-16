package storage

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Session struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	TopicID         string             `bson:"topicId" json:"topicId"`
	DurationSeconds int                `bson:"durationSeconds" json:"durationSeconds"`
	CompletedAt     time.Time          `bson:"completedAt" json:"completedAt"`
}

func CreateSession(db *mongo.Database, session Session) error {
	collection := db.Collection("sessions")

	// Set the completed time to now
	session.CompletedAt = time.Now()

	_, err := collection.InsertOne(context.Background(), session)
	return err
}
