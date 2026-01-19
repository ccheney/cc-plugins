// Package shared provides base building blocks for domain-driven design.
// It contains Entity and AggregateRoot types that form the foundation
// for all domain models following DDD tactical patterns.
package shared

// Entity represents a domain object with a unique identity.
// Entities are distinguished by their identity rather than their attributes.
// Two entities with the same ID are considered equal, regardless of their
// other attribute values.
//
// The type parameter ID must be comparable to support identity comparison.
type Entity[ID comparable] struct {
	id ID
}

// NewEntity creates a new Entity with the specified identifier.
// This constructor should be used when creating new domain entities
// that require identity tracking.
func NewEntity[ID comparable](id ID) Entity[ID] {
	return Entity[ID]{id: id}
}

// ID returns the unique identifier of this entity.
func (e Entity[ID]) ID() ID {
	return e.id
}

// Equals compares two entities by their identity.
// Returns true if both entities have the same ID, regardless of
// their other attribute values.
func (e Entity[ID]) Equals(other Entity[ID]) bool {
	return e.id == other.id
}
