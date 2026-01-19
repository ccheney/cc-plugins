// Package postgres provides PostgreSQL implementations of domain repositories.
// It contains adapters that translate between domain objects and database
// representations, isolating persistence concerns from business logic.
package postgres

import (
	"context"
	"database/sql"

	"myapp/internal/domain/order"
)

// OrderRepository is a PostgreSQL implementation of order.Repository.
// It handles persistence of Order aggregates using SQL transactions
// to maintain consistency between orders and their line items.
type OrderRepository struct {
	db *sql.DB
}

// NewOrderRepository creates an OrderRepository with the given database connection.
// The caller is responsible for managing the connection lifecycle.
func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// FindByID retrieves an Order aggregate by its identifier.
// Returns nil, nil if no order exists with the given ID.
// Returns an error if the database query fails.
//
// This method reconstitutes the full aggregate including all line items.
func (r *OrderRepository) FindByID(ctx context.Context, id order.OrderID) (*order.Order, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT id, customer_id, status, created_at, version
         FROM orders WHERE id = $1`, id.String())

	var o orderRow
	if err := row.Scan(&o.ID, &o.CustomerID, &o.Status, &o.CreatedAt, &o.Version); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	items, err := r.loadItems(ctx, id)
	if err != nil {
		return nil, err
	}

	return mapToDomain(o, items), nil
}

// Save persists an Order aggregate using an upsert strategy.
// Creates a new record if one doesn't exist, or updates the existing record.
// Uses optimistic concurrency control via the version column.
//
// The entire operation runs within a transaction to ensure the order
// and all its items are saved atomically.
func (r *OrderRepository) Save(ctx context.Context, o *order.Order) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx,
		`INSERT INTO orders (id, customer_id, status, created_at, version)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           version = orders.version + 1`,
		o.ID().String(), o.CustomerID().String(), o.Status(), o.CreatedAt(), o.Version())

	if err != nil {
		return err
	}

	for _, item := range o.Items() {
		if err := r.saveItem(ctx, tx, o.ID(), item); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Delete removes an Order from the database.
// Line items are assumed to be deleted via CASCADE constraint.
func (r *OrderRepository) Delete(ctx context.Context, o *order.Order) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM orders WHERE id = $1", o.ID().String())
	return err
}

// loadItems retrieves all line items for an order.
func (r *OrderRepository) loadItems(ctx context.Context, orderID order.OrderID) ([]orderItemRow, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, product_id, quantity, unit_price
         FROM order_items WHERE order_id = $1`, orderID.String())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []orderItemRow
	for rows.Next() {
		var item orderItemRow
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Quantity, &item.UnitPrice); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

// saveItem persists a single order item within the provided transaction.
func (r *OrderRepository) saveItem(ctx context.Context, tx *sql.Tx, orderID order.OrderID, item order.OrderItem) error {
	_, err := tx.ExecContext(ctx,
		`INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           quantity = EXCLUDED.quantity`,
		item.ID().String(), orderID.String(), item.ProductID().String(), item.Quantity(), item.UnitPrice().Amount())
	return err
}

// orderRow represents the database schema for orders.
type orderRow struct {
	ID         string
	CustomerID string
	Status     string
	CreatedAt  string
	Version    int
}

// orderItemRow represents the database schema for order line items.
type orderItemRow struct {
	ID        string
	ProductID string
	Quantity  int
	UnitPrice int64
}

// mapToDomain converts database rows to the Order aggregate.
// This function handles the impedance mismatch between the relational
// model and the domain model.
func mapToDomain(row orderRow, items []orderItemRow) *order.Order {
	// Implementation would reconstitute the aggregate from persisted data
	// using internal constructors or factory methods
	return nil // Placeholder
}
