// internal/domain/order/repository.go
package order

import "context"

// Repository defines the persistence contract for Order aggregates.
// This is a driven port (secondary port) in hexagonal architecture terms,
// allowing the domain to remain independent of persistence implementation.
//
// Implementations of this interface reside in the infrastructure layer
// and handle the translation between domain objects and persistence formats.
type Repository interface {
	// FindByID retrieves an Order by its unique identifier.
	// Returns nil, nil if no order exists with the given ID.
	// Returns an error if the lookup operation fails.
	FindByID(ctx context.Context, id OrderID) (*Order, error)

	// Save persists an Order aggregate, creating or updating as needed.
	// Implementations should handle optimistic concurrency using the
	// aggregate's version field.
	Save(ctx context.Context, order *Order) error

	// Delete removes an Order from the persistence store.
	// Returns an error if the deletion fails.
	Delete(ctx context.Context, order *Order) error
}
