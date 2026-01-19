// domain/shared/value_object.ts

/**
 * Base class for value objects in Domain-Driven Design.
 *
 * Value objects are immutable domain primitives that represent descriptive
 * aspects of the domain with no conceptual identity. They are defined entirely
 * by their attributes and are interchangeable when their values are equal.
 *
 * Value objects should be:
 * - Immutable: Once created, their state cannot change
 * - Self-validating: Invalid value objects should not be constructible
 * - Side-effect free: Methods should not modify state
 *
 * @typeParam T - The type of the properties object
 *
 * @example
 * ```typescript
 * interface AddressProps {
 *   street: string;
 *   city: string;
 *   zipCode: string;
 * }
 *
 * class Address extends ValueObject<AddressProps> {
 *   static create(street: string, city: string, zipCode: string): Address {
 *     return new Address({ street, city, zipCode });
 *   }
 * }
 * ```
 */
export abstract class ValueObject<T> {
  /** The immutable properties of this value object. */
  protected readonly props: T;

  /**
   * Create a new value object with the specified properties.
   *
   * Properties are frozen to ensure immutability.
   *
   * @param props - The properties for this value object
   */
  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * Compare this value object with another for equality.
   *
   * Two value objects are equal if all their properties are equal.
   *
   * @param other - The value object to compare against
   * @returns True if both value objects have equal properties
   */
  equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
