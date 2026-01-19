// internal/domain/order/value_objects.go
package order

import (
	"errors"

	"github.com/google/uuid"
)

// OrderID is a value object representing the unique identifier for an Order.
// It encapsulates the ID format and validation rules, ensuring only valid
// identifiers can exist in the domain.
type OrderID struct {
	value string
}

// NewOrderID generates a new unique OrderID using UUID v4.
// Use this when creating new orders that need a fresh identifier.
func NewOrderID() OrderID {
	return OrderID{value: uuid.New().String()}
}

// OrderIDFrom creates an OrderID from an existing string value.
// Returns an error if the provided value is empty.
// Use this when reconstituting orders from persistence.
func OrderIDFrom(value string) (OrderID, error) {
	if value == "" {
		return OrderID{}, errors.New("order ID cannot be empty")
	}
	return OrderID{value: value}, nil
}

// String returns the string representation of the OrderID.
// Implements fmt.Stringer for convenient logging and serialization.
func (id OrderID) String() string {
	return id.value
}

// CustomerID is a value object representing a customer's unique identifier.
type CustomerID struct {
	value string
}

// CustomerIDFrom creates a CustomerID from an existing string value.
// Returns an error if the provided value is empty.
func CustomerIDFrom(value string) (CustomerID, error) {
	if value == "" {
		return CustomerID{}, errors.New("customer ID cannot be empty")
	}
	return CustomerID{value: value}, nil
}

// String returns the string representation of the CustomerID.
func (id CustomerID) String() string {
	return id.value
}

// ProductID is a value object representing a product's unique identifier.
type ProductID struct {
	value string
}

// ProductIDFrom creates a ProductID from an existing string value.
// Returns an error if the provided value is empty.
func ProductIDFrom(value string) (ProductID, error) {
	if value == "" {
		return ProductID{}, errors.New("product ID cannot be empty")
	}
	return ProductID{value: value}, nil
}

// String returns the string representation of the ProductID.
func (id ProductID) String() string {
	return id.value
}

// Money is a value object representing a monetary amount with currency.
// It ensures monetary calculations maintain precision by storing amounts
// in the smallest currency unit (e.g., cents for USD).
//
// Money is immutable; all operations return new Money instances.
type Money struct {
	amount   int64  // Amount in smallest currency unit (e.g., cents)
	currency string // ISO 4217 currency code (e.g., "USD")
}

// NewMoney creates a Money value object with the specified amount and currency.
// The amount should be in the smallest currency unit (e.g., cents).
// Returns an error if the amount is negative.
func NewMoney(amount int64, currency string) (Money, error) {
	if amount < 0 {
		return Money{}, errors.New("amount cannot be negative")
	}
	return Money{amount: amount, currency: currency}, nil
}

// Add combines two Money values of the same currency.
// Returns an error if the currencies do not match.
func (m Money) Add(other Money) (Money, error) {
	if m.currency != other.currency {
		return Money{}, errors.New("currency mismatch")
	}
	return Money{amount: m.amount + other.amount, currency: m.currency}, nil
}

// Multiply scales the Money amount by an integer factor.
// Returns a new Money instance with the multiplied amount.
func (m Money) Multiply(factor int) Money {
	return Money{amount: m.amount * int64(factor), currency: m.currency}
}

// Amount returns the monetary amount in the smallest currency unit.
func (m Money) Amount() int64 { return m.amount }

// Currency returns the ISO 4217 currency code.
func (m Money) Currency() string { return m.currency }
