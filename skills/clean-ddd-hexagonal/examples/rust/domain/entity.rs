//! Base domain entity building blocks for Domain-Driven Design.
//!
//! This module provides the foundational traits for implementing DDD tactical
//! patterns: [`Entity`] for identity-based domain objects and [`AggregateRoot`]
//! for consistency boundaries with domain event support.

// crates/domain/src/shared/entity.rs
use std::hash::Hash;

/// A domain object distinguished by its identity rather than attributes.
///
/// Entities are objects where identity matters more than their current state.
/// Two entities with the same ID are considered equal, regardless of their
/// other attribute values.
///
/// # Type Parameters
///
/// * `Id` - The identifier type, which must be equatable, hashable, and cloneable.
///
/// # Example
///
/// ```rust
/// use domain::shared::Entity;
///
/// struct User {
///     id: UserId,
///     name: String,
/// }
///
/// impl Entity for User {
///     type Id = UserId;
///     fn id(&self) -> &Self::Id { &self.id }
/// }
/// ```
pub trait Entity {
    /// The type used to uniquely identify this entity.
    type Id: Eq + Hash + Clone;

    /// Returns a reference to this entity's unique identifier.
    fn id(&self) -> &Self::Id;
}

/// A cluster of domain objects treated as a single unit for data changes.
///
/// Aggregate roots serve as the entry point for all modifications within the
/// aggregate boundary. They maintain invariants and collect domain events
/// that represent significant state changes.
///
/// External objects should only hold references to the aggregate root, not
/// to internal entities. All persistence operations work at the aggregate level.
///
/// # Type Parameters
///
/// * `Event` - The domain event type emitted by this aggregate.
///
/// # Example
///
/// ```rust
/// use domain::shared::{Entity, AggregateRoot};
///
/// impl AggregateRoot for Order {
///     type Event = OrderEvent;
///
///     fn domain_events(&self) -> &[Self::Event] {
///         &self.events
///     }
///
///     fn clear_events(&mut self) {
///         self.events.clear();
///     }
/// }
/// ```
pub trait AggregateRoot: Entity {
    /// The type of domain events emitted by this aggregate.
    type Event;

    /// Returns a slice of all uncommitted domain events.
    ///
    /// These events represent changes that have occurred since the last
    /// persistence operation.
    fn domain_events(&self) -> &[Self::Event];

    /// Clears all collected domain events.
    ///
    /// Call this after events have been successfully published to prevent
    /// duplicate event processing.
    fn clear_events(&mut self);
}
