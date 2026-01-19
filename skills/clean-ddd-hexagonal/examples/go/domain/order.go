// internal/domain/order/order.go
package order

import (
	"errors"
	"time"

	"myapp/internal/domain/shared"
)

// OrderStatus represents the lifecycle state of an Order.
// Orders transition through states: Draft -> Confirmed -> Shipped.
// Cancelled is a terminal state reachable from Draft or Confirmed.
type OrderStatus string

const (
	// OrderStatusDraft indicates a newly created order that can be modified.
	OrderStatusDraft OrderStatus = "draft"

	// OrderStatusConfirmed indicates the order has been finalized and paid.
	OrderStatusConfirmed OrderStatus = "confirmed"

	// OrderStatusShipped indicates the order has been dispatched to the customer.
	OrderStatusShipped OrderStatus = "shipped"

	// OrderStatusCancelled indicates the order has been cancelled.
	OrderStatusCancelled OrderStatus = "cancelled"
)

// OrderItem represents a line item within an Order.
// It tracks the product, quantity, and unit price for a single product type.
type OrderItem struct {
	productID ProductID
	quantity  int
	unitPrice Money
}

// NewOrderItem creates a new order item with the specified product details.
func NewOrderItem(productID ProductID, quantity int, unitPrice Money) OrderItem {
	return OrderItem{
		productID: productID,
		quantity:  quantity,
		unitPrice: unitPrice,
	}
}

// ProductID returns the identifier of the product in this line item.
func (i OrderItem) ProductID() ProductID { return i.productID }

// Quantity returns the number of units ordered.
func (i OrderItem) Quantity() int { return i.quantity }

// UnitPrice returns the price per unit at the time of ordering.
func (i OrderItem) UnitPrice() Money { return i.unitPrice }

// Subtotal calculates the total price for this line item.
func (i OrderItem) Subtotal() Money {
	return i.unitPrice.Multiply(i.quantity)
}

// IncreaseQuantity adds additional units to this line item.
func (i *OrderItem) IncreaseQuantity(amount int) {
	i.quantity += amount
}

// Order is an aggregate root representing a customer's purchase request.
// It maintains the consistency boundary for order items, status transitions,
// and business rules around order modifications.
//
// Orders follow a state machine pattern where certain operations are only
// valid in specific states. Domain events are emitted on significant
// state changes.
type Order struct {
	shared.AggregateRoot[OrderID]
	customerID CustomerID
	items      []OrderItem
	status     OrderStatus
	createdAt  time.Time
}

// NewOrder creates a new Order aggregate in Draft status.
// Emits an OrderCreated domain event upon creation.
func NewOrder(customerID CustomerID) *Order {
	id := NewOrderID()
	order := &Order{
		AggregateRoot: shared.AggregateRoot[OrderID]{
			Entity: shared.NewEntity(id),
		},
		customerID: customerID,
		items:      make([]OrderItem, 0),
		status:     OrderStatusDraft,
		createdAt:  time.Now(),
	}
	order.AddEvent(NewOrderCreatedEvent(id, customerID))
	return order
}

// AddItem adds a product to the order or increases quantity if already present.
// Returns an error if the order is cancelled or the quantity is not positive.
//
// This method enforces the invariant that cancelled orders cannot be modified
// and demonstrates idempotent handling of duplicate product additions.
func (o *Order) AddItem(productID ProductID, quantity int, unitPrice Money) error {
	if o.status == OrderStatusCancelled {
		return errors.New("cannot modify cancelled order")
	}
	if quantity <= 0 {
		return errors.New("quantity must be positive")
	}

	// Check if item already exists - merge quantities
	for i := range o.items {
		if o.items[i].ProductID() == productID {
			o.items[i].IncreaseQuantity(quantity)
			return nil
		}
	}

	item := NewOrderItem(productID, quantity, unitPrice)
	o.items = append(o.items, item)
	return nil
}

// Confirm transitions the order from Draft to Confirmed status.
// Returns an error if the order is not in Draft status or has no items.
// Emits an OrderConfirmed domain event on success.
func (o *Order) Confirm() error {
	if o.status != OrderStatusDraft {
		return errors.New("can only confirm draft orders")
	}
	if len(o.items) == 0 {
		return errors.New("cannot confirm empty order")
	}

	o.status = OrderStatusConfirmed
	o.AddEvent(NewOrderConfirmedEvent(o.ID(), o.Total()))
	return nil
}

// Total calculates the sum of all line item subtotals.
// Returns a Money value in USD (default currency).
func (o *Order) Total() Money {
	total := Money{amount: 0, currency: "USD"}
	for _, item := range o.items {
		subtotal := item.Subtotal()
		total, _ = total.Add(subtotal)
	}
	return total
}

// Status returns the current lifecycle state of the order.
func (o *Order) Status() OrderStatus { return o.status }

// Items returns a copy of all line items in the order.
func (o *Order) Items() []OrderItem { return o.items }

// CustomerID returns the identifier of the customer who placed the order.
func (o *Order) CustomerID() CustomerID { return o.customerID }

// CreatedAt returns the timestamp when the order was created.
func (o *Order) CreatedAt() time.Time { return o.createdAt }
