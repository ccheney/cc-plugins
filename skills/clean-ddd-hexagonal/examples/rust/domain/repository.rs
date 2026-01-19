//! Repository interface for Order aggregate persistence.
//!
//! This module defines the abstract repository trait that the domain layer
//! uses to persist Order aggregates. Concrete implementations reside in the
//! infrastructure layer.

// crates/domain/src/order/repository.rs
use async_trait::async_trait;
use super::aggregate::Order;
use super::value_objects::OrderId;

/// Repository trait for Order aggregate persistence.
///
/// This trait represents a driven port (secondary port) in hexagonal
/// architecture. It defines the persistence contract that the domain requires,
/// allowing the infrastructure layer to provide concrete implementations
/// for different storage mechanisms.
///
/// Repositories operate on aggregates as a whole, not on individual entities
/// within the aggregate boundary.
///
/// # Example
///
/// ```rust
/// use domain::order::{OrderRepository, Order, OrderId};
///
/// struct PostgresOrderRepository { /* ... */ }
///
/// #[async_trait]
/// impl OrderRepository for PostgresOrderRepository {
///     async fn find_by_id(&self, id: &OrderId) -> Result<Option<Order>, RepositoryError> {
///         // Implementation
///     }
///     // ...
/// }
/// ```
#[async_trait]
pub trait OrderRepository: Send + Sync {
    /// Retrieves an Order by its unique identifier.
    ///
    /// # Arguments
    ///
    /// * `id` - The OrderId to search for.
    ///
    /// # Returns
    ///
    /// * `Ok(Some(order))` - If an order with the given ID exists.
    /// * `Ok(None)` - If no order exists with the given ID.
    /// * `Err(RepositoryError)` - If a database error occurs.
    async fn find_by_id(&self, id: &OrderId) -> Result<Option<Order>, RepositoryError>;

    /// Persists an Order aggregate.
    ///
    /// This method handles both creation of new orders and updates to existing
    /// ones. Implementations should use optimistic concurrency control via
    /// the aggregate's version field.
    ///
    /// # Arguments
    ///
    /// * `order` - The Order aggregate to persist.
    ///
    /// # Errors
    ///
    /// Returns [`RepositoryError::Database`] if the save operation fails.
    async fn save(&self, order: &Order) -> Result<(), RepositoryError>;

    /// Removes an Order from the persistence store.
    ///
    /// # Arguments
    ///
    /// * `order` - The Order aggregate to delete.
    ///
    /// # Errors
    ///
    /// Returns [`RepositoryError::Database`] if the delete operation fails.
    async fn delete(&self, order: &Order) -> Result<(), RepositoryError>;
}

/// Errors that can occur during repository operations.
#[derive(Debug, thiserror::Error)]
pub enum RepositoryError {
    /// A database operation failed.
    #[error("Database error: {0}")]
    Database(String),

    /// The requested entity was not found.
    #[error("Not found")]
    NotFound,
}
