// Package placeorder implements the place order use case.
// It orchestrates the creation of new orders by coordinating
// between the domain layer and external services.
package placeorder

// Command represents the input data for the place order use case.
// Commands are simple data transfer objects that carry all information
// needed to execute the use case, with no behavior of their own.
type Command struct {
	// CustomerID is the unique identifier of the customer placing the order.
	CustomerID string

	// Items contains the products and quantities to order.
	Items []ItemCommand
}

// ItemCommand represents a single line item in the order command.
type ItemCommand struct {
	// ProductID is the unique identifier of the product to order.
	ProductID string

	// Quantity is the number of units to order. Must be positive.
	Quantity int
}
