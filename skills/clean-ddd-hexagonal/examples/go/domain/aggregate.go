// internal/domain/shared/aggregate.go
package shared

import "time"

// DomainEvent represents something significant that happened in the domain.
// Domain events capture the intent and outcome of domain operations,
// enabling event-driven architectures and maintaining audit trails.
type DomainEvent interface {
	// EventType returns a string identifier for this event type.
	// This is used for event serialization and routing.
	EventType() string

	// OccurredAt returns the timestamp when this event was created.
	OccurredAt() time.Time
}

// AggregateRoot is a cluster of domain objects treated as a single unit.
// It serves as the entry point for all modifications to the aggregate,
// ensuring consistency boundaries are maintained. AggregateRoot extends
// Entity with domain event collection capabilities.
//
// All changes to entities within the aggregate must go through the
// aggregate root to maintain invariants.
type AggregateRoot[ID comparable] struct {
	Entity[ID]
	events  []DomainEvent
	version int
}

// AddEvent records a domain event that occurred as part of a state change.
// Events are collected and typically published after the aggregate is
// successfully persisted.
func (a *AggregateRoot[ID]) AddEvent(event DomainEvent) {
	a.events = append(a.events, event)
}

// Events returns all uncommitted domain events for this aggregate.
// These events represent changes that have occurred since the last
// persistence operation.
func (a *AggregateRoot[ID]) Events() []DomainEvent {
	return a.events
}

// ClearEvents removes all collected domain events.
// This should be called after events have been successfully published
// to prevent duplicate event processing.
func (a *AggregateRoot[ID]) ClearEvents() {
	a.events = nil
}

// Version returns the current version of this aggregate.
// Used for optimistic concurrency control during persistence.
func (a *AggregateRoot[ID]) Version() int {
	return a.version
}
