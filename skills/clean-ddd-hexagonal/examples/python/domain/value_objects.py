# src/domain/order/value_objects.py
"""Value objects for the Order domain.

Value objects are immutable domain primitives that represent descriptive
aspects of the domain with no conceptual identity. They are defined by their
attributes and are interchangeable when their values are equal.
"""
from dataclasses import dataclass
import uuid


@dataclass(frozen=True)
class OrderId:
    """Unique identifier for an Order aggregate.

    This value object encapsulates the format and validation rules for order
    identifiers, ensuring only valid IDs can exist in the domain.

    Attributes:
        value: The string representation of the order identifier.
    """

    value: str

    @classmethod
    def generate(cls) -> 'OrderId':
        """Generate a new unique OrderId using UUID v4.

        Returns:
            A new OrderId instance with a randomly generated UUID.
        """
        return cls(value=str(uuid.uuid4()))

    @classmethod
    def from_string(cls, value: str) -> 'OrderId':
        """Create an OrderId from an existing string value.

        Use this method when reconstituting orders from persistence or
        external input.

        Args:
            value: The string representation of the order ID.

        Returns:
            A validated OrderId instance.

        Raises:
            ValueError: If the value is empty or whitespace-only.
        """
        if not value or not value.strip():
            raise ValueError("Order ID cannot be empty")
        return cls(value=value)


@dataclass(frozen=True)
class Money:
    """A monetary amount with currency, stored in smallest currency units.

    Money is immutable and uses integer arithmetic to avoid floating-point
    precision issues. All amounts are stored in the smallest currency unit
    (e.g., cents for USD).

    Attributes:
        amount: The monetary value in smallest currency units (e.g., cents).
        currency: ISO 4217 currency code (e.g., "USD", "EUR").
    """

    amount: int
    currency: str

    def __post_init__(self) -> None:
        """Validate money invariants after initialization.

        Raises:
            ValueError: If amount is negative.
        """
        if self.amount < 0:
            raise ValueError("Amount cannot be negative")

    @classmethod
    def zero(cls, currency: str = "USD") -> 'Money':
        """Create a zero-amount Money instance.

        Args:
            currency: The ISO 4217 currency code. Defaults to "USD".

        Returns:
            A Money instance with zero amount.
        """
        return cls(amount=0, currency=currency)

    def add(self, other: 'Money') -> 'Money':
        """Add two Money values of the same currency.

        Args:
            other: The Money value to add.

        Returns:
            A new Money instance with the combined amount.

        Raises:
            ValueError: If currencies do not match.
        """
        if self.currency != other.currency:
            raise ValueError("Currency mismatch")
        return Money(amount=self.amount + other.amount, currency=self.currency)

    def multiply(self, factor: int) -> 'Money':
        """Multiply the amount by a scalar factor.

        Args:
            factor: The integer multiplier.

        Returns:
            A new Money instance with the scaled amount.
        """
        return Money(amount=self.amount * factor, currency=self.currency)


@dataclass(frozen=True)
class CustomerId:
    """Unique identifier for a Customer.

    Attributes:
        value: The string representation of the customer identifier.
    """

    value: str

    @classmethod
    def from_string(cls, value: str) -> 'CustomerId':
        """Create a CustomerId from a string value.

        Args:
            value: The string representation of the customer ID.

        Returns:
            A validated CustomerId instance.

        Raises:
            ValueError: If the value is empty or whitespace-only.
        """
        if not value or not value.strip():
            raise ValueError("Customer ID cannot be empty")
        return cls(value=value)


@dataclass(frozen=True)
class ProductId:
    """Unique identifier for a Product.

    Attributes:
        value: The string representation of the product identifier.
    """

    value: str

    @classmethod
    def from_string(cls, value: str) -> 'ProductId':
        """Create a ProductId from a string value.

        Args:
            value: The string representation of the product ID.

        Returns:
            A validated ProductId instance.

        Raises:
            ValueError: If the value is empty or whitespace-only.
        """
        if not value or not value.strip():
            raise ValueError("Product ID cannot be empty")
        return cls(value=value)
