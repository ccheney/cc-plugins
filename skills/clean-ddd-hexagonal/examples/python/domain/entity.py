# src/domain/shared/entity.py
"""Base domain entity building blocks for Domain-Driven Design.

This module provides the foundational classes for implementing DDD tactical
patterns: Entity for identity-based domain objects and AggregateRoot for
consistency boundaries with domain event support.
"""
from abc import ABC
from typing import Generic, TypeVar, List
from dataclasses import dataclass, field

ID = TypeVar('ID')


@dataclass
class Entity(ABC, Generic[ID]):
    """A domain object distinguished by its identity rather than attributes.

    Entities are mutable objects where identity matters more than their
    current state. Two entities with the same ID are considered equal,
    regardless of their other attribute values.

    Attributes:
        _id: The unique identifier for this entity.
    """

    _id: ID

    @property
    def id(self) -> ID:
        """Return the unique identifier of this entity."""
        return self._id

    def __eq__(self, other: object) -> bool:
        """Compare entities by identity, not by attribute values.

        Args:
            other: The object to compare against.

        Returns:
            True if both are Entity instances with matching IDs.
        """
        if not isinstance(other, Entity):
            return False
        return self._id == other._id

    def __hash__(self) -> int:
        """Return hash based on entity identity for use in collections."""
        return hash(self._id)


@dataclass
class AggregateRoot(Entity[ID], Generic[ID]):
    """A cluster of domain objects treated as a single unit for data changes.

    Aggregate roots serve as the entry point for all modifications within the
    aggregate boundary. They maintain invariants and collect domain events
    that represent significant state changes.

    External objects should only hold references to the aggregate root, not
    to internal entities. All persistence operations work at the aggregate
    level.

    Attributes:
        _domain_events: Uncommitted events from recent state changes.
        _version: Optimistic concurrency version for persistence.
    """

    _domain_events: List['DomainEvent'] = field(default_factory=list)
    _version: int = 0

    def add_event(self, event: 'DomainEvent') -> None:
        """Record a domain event for later publishing.

        Args:
            event: The domain event representing a significant state change.
        """
        self._domain_events.append(event)

    @property
    def domain_events(self) -> List['DomainEvent']:
        """Return a copy of all uncommitted domain events.

        Returns:
            A list copy of pending domain events to prevent external mutation.
        """
        return self._domain_events.copy()

    def clear_events(self) -> None:
        """Remove all collected domain events after successful publishing."""
        self._domain_events.clear()
