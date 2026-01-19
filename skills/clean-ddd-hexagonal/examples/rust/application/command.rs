//! Command DTOs for the place order use case.
//!
//! Commands are simple data transfer objects that carry all information needed
//! to execute a use case. They have no behavior and are validated at the
//! application layer boundary.

// crates/application/src/place_order/command.rs

/// Command to create and persist a new order.
///
/// This command encapsulates all data required to place an order on behalf
/// of a customer. It is processed by [`PlaceOrderHandler`].
///
/// # Example
///
/// ```rust
/// let command = PlaceOrderCommand {
///     customer_id: "cust-123".to_string(),
///     items: vec![
///         PlaceOrderItem {
///             product_id: "prod-456".to_string(),
///             quantity: 2,
///         },
///     ],
/// };
/// ```
#[derive(Debug, Clone)]
pub struct PlaceOrderCommand {
    /// The unique identifier of the customer placing the order.
    pub customer_id: String,

    /// The items to include in the order.
    pub items: Vec<PlaceOrderItem>,
}

/// Data for a single line item in a place order command.
#[derive(Debug, Clone)]
pub struct PlaceOrderItem {
    /// The unique identifier of the product to order.
    pub product_id: String,

    /// The number of units to order. Must be positive.
    pub quantity: u32,
}
