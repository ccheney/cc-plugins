// internal/application/place_order/handler.go
package placeorder

import (
	"context"

	"myapp/internal/application/ports"
	"myapp/internal/domain/order"
)

// Handler implements the place order use case.
// It orchestrates the workflow of creating an order, validating products,
// persisting the aggregate, and publishing domain events.
//
// Handler depends on abstractions (ports) rather than concrete implementations,
// following the Dependency Inversion Principle. Dependencies are injected
// through the constructor.
type Handler struct {
	orderRepo      order.Repository
	productRepo    ports.ProductRepository
	eventPublisher ports.EventPublisher
}

// NewHandler creates a Handler with the required dependencies.
// All dependencies must be non-nil; no validation is performed.
func NewHandler(
	orderRepo order.Repository,
	productRepo ports.ProductRepository,
	eventPublisher ports.EventPublisher,
) *Handler {
	return &Handler{
		orderRepo:      orderRepo,
		productRepo:    productRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle executes the place order use case.
// It creates a new order with the specified items, persists it,
// and publishes any resulting domain events.
//
// Returns the new order's ID on success, or an error if:
//   - The customer ID is invalid
//   - Any product cannot be found
//   - The order fails to save
//   - Event publishing fails
//
// Note: This implementation publishes events after persistence. In a
// production system, consider using the Outbox pattern for reliability.
func (h *Handler) Handle(ctx context.Context, cmd Command) (string, error) {
	customerID, err := order.CustomerIDFrom(cmd.CustomerID)
	if err != nil {
		return "", err
	}

	newOrder := order.NewOrder(customerID)

	for _, item := range cmd.Items {
		product, err := h.productRepo.FindByID(ctx, item.ProductID)
		if err != nil {
			return "", err
		}

		productID, _ := order.ProductIDFrom(item.ProductID)
		if err := newOrder.AddItem(productID, item.Quantity, product.Price); err != nil {
			return "", err
		}
	}

	if err := h.orderRepo.Save(ctx, newOrder); err != nil {
		return "", err
	}

	// Publish domain events after successful persistence
	for _, event := range newOrder.Events() {
		if err := h.eventPublisher.Publish(ctx, event); err != nil {
			return "", err
		}
	}
	newOrder.ClearEvents()

	return newOrder.ID().String(), nil
}
