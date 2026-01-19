// domain/shared/email.ts
import { ValueObject } from './value_object';

/**
 * Properties for the Email value object.
 */
interface EmailProps {
  /** The normalized email address. */
  value: string;
}

/**
 * A value object representing a validated email address.
 *
 * Email addresses are normalized to lowercase and validated against
 * a standard format. Invalid emails cannot be constructed.
 *
 * @example
 * ```typescript
 * const email = Email.create('User@Example.COM');
 * console.log(email.value);  // 'user@example.com'
 * console.log(email.domain); // 'example.com'
 * ```
 */
export class Email extends ValueObject<EmailProps> {
  /** Regular expression for basic email format validation. */
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Private constructor to enforce use of factory methods.
   * @param props - The email properties
   */
  private constructor(props: EmailProps) {
    super(props);
  }

  /**
   * Create an Email from a string value with validation.
   *
   * The email is normalized to lowercase and trimmed of whitespace.
   *
   * @param email - The email address string
   * @returns A validated and normalized Email instance
   * @throws InvalidEmailError if the format is invalid
   */
  static create(email: string): Email {
    const normalized = email.toLowerCase().trim();
    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new InvalidEmailError(email);
    }
    return new Email({ value: normalized });
  }

  /** Get the full email address. */
  get value(): string { return this.props.value; }

  /** Get the domain portion of the email (after @). */
  get domain(): string { return this.value.split('@')[1]; }
}
