//! Order aggregate root implementation.
//!
//! This module contains the Order aggregate, which is the central domain model
//! for purchase transactions. It enforces business rules around order lifecycle,
//! item management, and state transitions.

// crates/domain/src/order/aggregate.rs
use crate::shared::{AggregateRoot, Entity};
use super::value_objects::*;
use super::events::*;
use thiserror::Error;

/// Lifecycle states for an Order.
///
/// Orders progress through states: `Draft` -> `Confirmed` -> `Shipped`.
/// `Cancelled` is a terminal state reachable from `Draft` or `Confirmed`.
#[derive(Debug, Clone, PartialEq)]
pub enum OrderStatus {
    /// Order is being created, can be modified freely.
    Draft,
    /// Payment received, order confirmed for fulfillment.
    Confirmed,
    /// Order has been dispatched to carrier.
    Shipped,
    /// Order has been cancelled.
    Cancelled,
}

/// Aggregate root representing a customer's purchase order.
///
/// The Order aggregate maintains the consistency boundary for all order-related
/// operations. It enforces business rules such as:
/// - Only draft orders can be modified
/// - Orders must have items before confirmation
/// - Cancelled orders cannot be modified
///
/// Domain events are emitted on significant state changes to enable
/// event-driven integration with other bounded contexts.
///
/// # Example
///
/// ```rust
/// use domain::order::{Order, CustomerId, ProductId, Money};
///
/// let customer_id = CustomerId::from_string("cust-123")?;
/// let mut order = Order::create(customer_id);
///
/// let product_id = ProductId::from_string("prod-456")?;
/// let price = Money::new(2999, "USD")?;
/// order.add_item(product_id, 2, price)?;
///
/// order.confirm()?;
/// ```
#[derive(Debug)]
pub struct Order {
    id: OrderId,
    customer_id: CustomerId,
    items: Vec<OrderItem>,
    status: OrderStatus,
    events: Vec<OrderEvent>,
}

impl Order {
    /// Creates a new Order in Draft status.
    ///
    /// This factory method is the only way to create new orders, ensuring
    /// the `OrderEvent::Created` event is always emitted.
    ///
    /// # Arguments
    ///
    /// * `customer_id` - The identifier of the customer placing the order.
    ///
    /// # Returns
    ///
    /// A new `Order` instance in `Draft` status.
    pub fn create(customer_id: CustomerId) -> Self {
        let id = OrderId::new();
        let mut order = Self {
            id: id.clone(),
            customer_id: customer_id.clone(),
            items: Vec::new(),
            status: OrderStatus::Draft,
            events: Vec::new(),
        };
        order.events.push(OrderEvent::Created {
            order_id: id,
            customer_id,
        });
        order
    }

    /// Adds a product to the order or increases quantity if already present.
    ///
    /// This method implements idempotent item addition - adding the same
    /// product twice will increase the quantity rather than creating
    /// duplicate line items.
    ///
    /// # Arguments
    ///
    /// * `product_id` - The identifier of the product to add.
    /// * `quantity` - Number of units to order (must be positive).
    /// * `unit_price` - The current price per unit.
    ///
    /// # Errors
    ///
    /// * [`OrderError::CannotModifyCancelled`] - If the order is cancelled.
    /// * [`OrderError::InvalidQuantity`] - If quantity is zero.
    pub fn add_item(
        &mut self,
        product_id: ProductId,
        quantity: u32,
        unit_price: Money,
    ) -> Result<(), OrderError> {
        if self.status == OrderStatus::Cancelled {
            return Err(OrderError::CannotModifyCancelled);
        }
        if quantity == 0 {
            return Err(OrderError::InvalidQuantity);
        }

        // Check if item exists - merge quantities
        if let Some(item) = self.items.iter_mut()
            .find(|i| i.product_id() == &product_id)
        {
            item.increase_quantity(quantity);
            return Ok(());
        }

        self.items.push(OrderItem::new(product_id, quantity, unit_price));
        Ok(())
    }

    /// Transitions the order from Draft to Confirmed status.
    ///
    /// Confirmation represents the customer's intent to purchase and typically
    /// occurs after payment processing. Only draft orders with at least one
    /// item can be confirmed.
    ///
    /// # Errors
    ///
    /// * [`OrderError::InvalidState`] - If order is not in Draft status.
    /// * [`OrderError::EmptyOrder`] - If order has no items.
    pub fn confirm(&mut self) -> Result<(), OrderError> {
        if self.status != OrderStatus::Draft {
            return Err(OrderError::InvalidState("Can only confirm draft orders"));
        }
        if self.items.is_empty() {
            return Err(OrderError::EmptyOrder);
        }

        self.status = OrderStatus::Confirmed;
        self.events.push(OrderEvent::Confirmed {
            order_id: self.id.clone(),
            total: self.total(),
        });
        Ok(())
    }

    /// Calculates the sum of all line item subtotals.
    ///
    /// # Returns
    ///
    /// The total order amount in USD.
    pub fn total(&self) -> Money {
        self.items.iter().fold(Money::zero("USD"), |acc, item| {
            acc.add(&item.subtotal()).unwrap_or(acc)
        })
    }

    /// Returns the current lifecycle state of the order.
    pub fn status(&self) -> &OrderStatus { &self.status }

    /// Returns a slice of all line items in the order.
    pub fn items(&self) -> &[OrderItem] { &self.items }
}

impl Entity for Order {
    type Id = OrderId;

    fn id(&self) -> &Self::Id { &self.id }
}

impl AggregateRoot for Order {
    type Event = OrderEvent;

    fn domain_events(&self) -> &[Self::Event] { &self.events }

    fn clear_events(&mut self) { self.events.clear(); }
}

/// Errors that can occur when operating on an [`Order`].
#[derive(Debug, Error)]
pub enum OrderError {
    /// Attempted to modify a cancelled order.
    #[error("Cannot modify cancelled order")]
    CannotModifyCancelled,

    /// Provided quantity was invalid (zero).
    #[error("Invalid quantity")]
    InvalidQuantity,

    /// Attempted to confirm an order with no items.
    #[error("Cannot confirm empty order")]
    EmptyOrder,

    /// Operation not allowed in current order state.
    #[error("Invalid state: {0}")]
    InvalidState(&'static str),
}
