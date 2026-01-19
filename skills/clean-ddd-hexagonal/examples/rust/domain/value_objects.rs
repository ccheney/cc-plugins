//! Value objects for the Order domain.
//!
//! Value objects are immutable domain primitives that represent descriptive
//! aspects of the domain with no conceptual identity. They are defined by their
//! attributes and are interchangeable when their values are equal.

// crates/domain/src/order/value_objects.rs
use thiserror::Error;
use uuid::Uuid;

/// Unique identifier for an Order aggregate.
///
/// This value object encapsulates the format and validation rules for order
/// identifiers, ensuring only valid IDs can exist in the domain.
///
/// # Example
///
/// ```rust
/// use domain::order::OrderId;
///
/// // Generate a new ID
/// let new_id = OrderId::new();
///
/// // Parse from string
/// let parsed_id = OrderId::from_string("550e8400-e29b-41d4-a716-446655440000")?;
/// ```
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct OrderId(Uuid);

impl OrderId {
    /// Creates a new unique OrderId using UUID v4.
    ///
    /// # Returns
    ///
    /// A new `OrderId` with a randomly generated UUID.
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }

    /// Creates an OrderId from an existing string value.
    ///
    /// Use this when reconstituting orders from persistence or external input.
    ///
    /// # Arguments
    ///
    /// * `s` - The string representation of the order ID (must be valid UUID format).
    ///
    /// # Errors
    ///
    /// Returns [`OrderIdError::InvalidFormat`] if the string is not a valid UUID.
    ///
    /// # Example
    ///
    /// ```rust
    /// let id = OrderId::from_string("550e8400-e29b-41d4-a716-446655440000")?;
    /// ```
    pub fn from_string(s: &str) -> Result<Self, OrderIdError> {
        Uuid::parse_str(s)
            .map(Self)
            .map_err(|_| OrderIdError::InvalidFormat)
    }

    /// Returns the string representation of this OrderId.
    pub fn as_str(&self) -> String {
        self.0.to_string()
    }
}

/// Errors that can occur when creating an [`OrderId`].
#[derive(Debug, Error)]
pub enum OrderIdError {
    /// The provided string is not a valid UUID format.
    #[error("Invalid order ID format")]
    InvalidFormat,
}

/// A value object representing a monetary amount with currency.
///
/// Money is immutable and uses integer arithmetic to avoid floating-point
/// precision issues. All amounts are stored in the smallest currency unit
/// (e.g., cents for USD).
///
/// # Example
///
/// ```rust
/// use domain::order::Money;
///
/// let price = Money::new(2999, "USD")?;  // $29.99
/// let tax = Money::new(240, "USD")?;     // $2.40
/// let total = price.add(&tax)?;          // $32.39
/// ```
#[derive(Debug, Clone, PartialEq)]
pub struct Money {
    /// Amount in smallest currency unit (e.g., cents).
    amount: i64,
    /// ISO 4217 currency code (e.g., "USD").
    currency: String,
}

impl Money {
    /// Creates a Money value object with the specified amount and currency.
    ///
    /// # Arguments
    ///
    /// * `amount` - The monetary value in smallest currency units (e.g., cents).
    /// * `currency` - ISO 4217 currency code (will be uppercased).
    ///
    /// # Errors
    ///
    /// Returns [`MoneyError::NegativeAmount`] if amount is negative.
    ///
    /// # Example
    ///
    /// ```rust
    /// let price = Money::new(2999, "usd")?;
    /// assert_eq!(price.currency(), "USD");
    /// ```
    pub fn new(amount: i64, currency: &str) -> Result<Self, MoneyError> {
        if amount < 0 {
            return Err(MoneyError::NegativeAmount);
        }
        Ok(Self {
            amount,
            currency: currency.to_uppercase(),
        })
    }

    /// Creates a zero-amount Money instance.
    ///
    /// # Arguments
    ///
    /// * `currency` - ISO 4217 currency code.
    ///
    /// # Example
    ///
    /// ```rust
    /// let zero = Money::zero("USD");
    /// assert_eq!(zero.amount(), 0);
    /// ```
    pub fn zero(currency: &str) -> Self {
        Self {
            amount: 0,
            currency: currency.to_uppercase(),
        }
    }

    /// Adds another Money value to this one.
    ///
    /// # Arguments
    ///
    /// * `other` - The Money to add.
    ///
    /// # Errors
    ///
    /// Returns [`MoneyError::CurrencyMismatch`] if currencies differ.
    ///
    /// # Example
    ///
    /// ```rust
    /// let a = Money::new(100, "USD")?;
    /// let b = Money::new(50, "USD")?;
    /// let sum = a.add(&b)?;
    /// assert_eq!(sum.amount(), 150);
    /// ```
    pub fn add(&self, other: &Money) -> Result<Self, MoneyError> {
        if self.currency != other.currency {
            return Err(MoneyError::CurrencyMismatch);
        }
        Ok(Self {
            amount: self.amount + other.amount,
            currency: self.currency.clone(),
        })
    }

    /// Multiplies this Money by a scalar factor.
    ///
    /// # Arguments
    ///
    /// * `factor` - The integer multiplier.
    ///
    /// # Returns
    ///
    /// A new Money instance with the scaled amount.
    pub fn multiply(&self, factor: i32) -> Self {
        Self {
            amount: self.amount * factor as i64,
            currency: self.currency.clone(),
        }
    }

    /// Returns the monetary amount in the smallest currency unit.
    pub fn amount(&self) -> i64 { self.amount }

    /// Returns the ISO 4217 currency code.
    pub fn currency(&self) -> &str { &self.currency }
}

/// Errors that can occur when working with [`Money`].
#[derive(Debug, Error)]
pub enum MoneyError {
    /// Attempted to create Money with a negative amount.
    #[error("Amount cannot be negative")]
    NegativeAmount,

    /// Attempted to perform an operation with mismatched currencies.
    #[error("Currency mismatch")]
    CurrencyMismatch,
}
