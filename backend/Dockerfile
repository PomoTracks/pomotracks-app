# Build Stage
FROM golang:1.23.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final Stage
FROM alpine:latest

# Copy the binary from builder
WORKDIR /app
COPY --from=builder /app/main .

# Expose port 8080
EXPOSE 8080

# Set the entrypoint
CMD ["./main"] 