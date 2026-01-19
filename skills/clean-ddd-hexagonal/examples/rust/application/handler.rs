//! Use case handler for placing orders.
//!
//! This module implements the application service that orchestrates the
//! place order workflow, coordinating between domain objects and
//! infrastructure services.

// crates/application/src/place_order/handler.rs
use std::sync::Arc;
use domain::order::{Order, OrderRepository, CustomerId, ProductId};
use crate::ports::ProductRepository;
use super::command::PlaceOrderCommand;
use thiserror::Error;

/// Application service that handles the place order use case.
///
/// This handler orchestrates the workflow of creating an order, validating
/// products, persisting the aggregate, and publishing domain events. It
/// depends on abstractions (traits) rather than concrete implementations,
/// following the Dependency Inversion Principle.
///
/// # Example
///
/// ```rust
/// let handler = PlaceOrderHandler::new(
///     Arc::new(postgres_order_repo),
///     Arc::new(postgres_product_repo),
/// );
///
/// let command = PlaceOrderCommand {
///     customer_id: "cust-123".to_string(),
///     items: vec![PlaceOrderItem {
///         product_id: "prod-456".to_string(),
///         quantity: 2,
///     }],
/// };
///
/// let order_id = handler.handle(command).await?;
/// ```
pub struct PlaceOrderHandler {
    order_repo: Arc<dyn OrderRepository>,
    product_repo: Arc<dyn ProductRepository>,
}

impl PlaceOrderHandler {
    /// Creates a new PlaceOrderHandler with the required dependencies.
    ///
    /// # Arguments
    ///
    /// * `order_repo` - Repository for persisting Order aggregates.
    /// * `product_repo` - Repository for retrieving Product information.
    pub fn new(
        order_repo: Arc<dyn OrderRepository>,
        product_repo: Arc<dyn ProductRepository>,
    ) -> Self {
        Self { order_repo, product_repo }
    }

    /// Executes the place order use case.
    ///
    /// Creates a new order with the specified items, validates products exist,
    /// persists the order, and returns the new order's ID.
    ///
    /// # Arguments
    ///
    /// * `cmd` - The place order command containing customer and item data.
    ///
    /// # Returns
    ///
    /// The ID of the newly created order as a string.
    ///
    /// # Errors
    ///
    /// * [`PlaceOrderError::InvalidCustomerId`] - If customer ID format is invalid.
    /// * [`PlaceOrderError::InvalidProductId`] - If product ID format is invalid.
    /// * [`PlaceOrderError::ProductNotFound`] - If any product does not exist.
    /// * [`PlaceOrderError::Order`] - If domain rules are violated.
    /// * [`PlaceOrderError::Repository`] - If persistence fails.
    pub async fn handle(&self, cmd: PlaceOrderCommand) -> Result<String, PlaceOrderError> {
        let customer_id = CustomerId::from_string(&cmd.customer_id)
            .map_err(|_| PlaceOrderError::InvalidCustomerId)?;

        let mut order = Order::create(customer_id);

        for item in cmd.items {
            let product = self.product_repo
                .find_by_id(&item.product_id)
                .await?
                .ok_or(PlaceOrderError::ProductNotFound(item.product_id.clone()))?;

            let product_id = ProductId::from_string(&item.product_id)
                .map_err(|_| PlaceOrderError::InvalidProductId)?;

            order.add_item(product_id, item.quantity, product.price)?;
        }

        self.order_repo.save(&order).await?;

        Ok(order.id().as_str())
    }
}

/// Errors that can occur when executing the place order use case.
#[derive(Debug, Error)]
pub enum PlaceOrderError {
    /// The provided customer ID format is invalid.
    #[error("Invalid customer ID")]
    InvalidCustomerId,

    /// The provided product ID format is invalid.
    #[error("Invalid product ID")]
    InvalidProductId,

    /// A product specified in the order was not found.
    #[error("Product not found: {0}")]
    ProductNotFound(String),

    /// A domain rule was violated during order creation.
    #[error("Order error: {0}")]
    Order(#[from] domain::order::OrderError),

    /// A database operation failed.
    #[error("Repository error: {0}")]
    Repository(#[from] domain::order::RepositoryError),
}
