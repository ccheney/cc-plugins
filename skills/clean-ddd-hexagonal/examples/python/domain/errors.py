# src/domain/order/errors.py
"""Domain-specific exceptions for the Order aggregate.

This module defines exceptions that represent domain rule violations and
invalid operations within the Order bounded context.
"""


class OrderError(Exception):
    """Base exception for order domain errors.

    All domain-specific exceptions in the Order bounded context should
    inherit from this class to enable consistent error handling at the
    application layer.

    Attributes:
        message: Human-readable description of the error.
    """

    def __init__(self, message: str) -> None:
        """Initialize the error with a descriptive message.

        Args:
            message: Description of what domain rule was violated.
        """
        self.message = message
        super().__init__(message)


class InvalidOrderStateError(OrderError):
    """Raised when an operation is attempted on an order in an invalid state.

    This error indicates a violation of the order state machine, such as
    attempting to ship an unconfirmed order or modify a cancelled order.
    """

    pass


class EmptyOrderError(OrderError):
    """Raised when attempting to confirm an order with no items.

    Orders must contain at least one item before they can be confirmed
    for fulfillment.
    """

    pass
