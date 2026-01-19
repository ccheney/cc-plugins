// domain/shared/money.ts
import { ValueObject } from './value_object';

/**
 * Properties for the Money value object.
 */
interface MoneyProps {
  /** The monetary amount in the currency's main unit (e.g., dollars). */
  amount: number;
  /** ISO 4217 currency code (e.g., "USD", "EUR"). */
  currency: string;
}

/**
 * A value object representing a monetary amount with currency.
 *
 * Money encapsulates monetary calculations and ensures currency consistency.
 * All operations return new Money instances, maintaining immutability.
 *
 * @example
 * ```typescript
 * const price = Money.create(29.99, 'USD');
 * const tax = Money.create(2.40, 'USD');
 * const total = price.add(tax); // Money { amount: 32.39, currency: 'USD' }
 * ```
 */
export class Money extends ValueObject<MoneyProps> {
  /**
   * Private constructor to enforce use of factory methods.
   * @param props - The money properties
   */
  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * Create a Money instance with validation.
   *
   * @param amount - The monetary amount (must be non-negative)
   * @param currency - The ISO 4217 currency code
   * @returns A new Money instance
   * @throws InvalidMoneyError if amount is negative
   * @throws InvalidMoneyError if currency is not supported
   */
  static create(amount: number, currency: string): Money {
    if (amount < 0) {
      throw new InvalidMoneyError('Amount cannot be negative');
    }
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new InvalidMoneyError(`Unsupported currency: ${currency}`);
    }
    return new Money({ amount, currency });
  }

  /**
   * Create a zero-amount Money instance.
   *
   * @param currency - The ISO 4217 currency code (defaults to USD)
   * @returns A Money instance with amount 0
   */
  static zero(currency: string = 'USD'): Money {
    return new Money({ amount: 0, currency });
  }

  /**
   * Create a Money instance from a cents/minor unit value.
   *
   * @param cents - The amount in the smallest currency unit
   * @param currency - The ISO 4217 currency code
   * @returns A Money instance with the converted amount
   */
  static fromCents(cents: number, currency: string): Money {
    return Money.create(cents / 100, currency);
  }

  /**
   * Add another Money value to this one.
   *
   * @param other - The Money to add
   * @returns A new Money instance with the sum
   * @throws CurrencyMismatchError if currencies differ
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another Money value from this one.
   *
   * @param other - The Money to subtract
   * @returns A new Money instance with the difference
   * @throws CurrencyMismatchError if currencies differ
   * @throws InvalidMoneyError if result would be negative
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.create(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply this Money by a scalar factor.
   *
   * @param factor - The multiplier
   * @returns A new Money instance with the product
   */
  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * Validate that another Money has the same currency.
   * @param other - The Money to compare
   * @throws CurrencyMismatchError if currencies differ
   */
  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }

  /** Get the monetary amount in the main currency unit. */
  get amount(): number { return this.props.amount; }

  /** Get the ISO 4217 currency code. */
  get currency(): string { return this.props.currency; }

  /** Get the amount in the smallest currency unit (e.g., cents). */
  get cents(): number { return Math.round(this.amount * 100); }
}
