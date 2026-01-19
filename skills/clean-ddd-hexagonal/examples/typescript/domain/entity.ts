// domain/shared/entity.ts

/**
 * Base class for domain objects that have a distinct identity.
 *
 * Entities are distinguished by their identity (ID) rather than their attributes.
 * Two entities are considered equal if they have the same identity, regardless
 * of their other attribute values.
 *
 * @typeParam T - The type of the entity's identifier
 *
 * @example
 * ```typescript
 * class User extends Entity<UserId> {
 *   constructor(id: UserId, private name: string) {
 *     super(id);
 *   }
 * }
 * ```
 */
export abstract class Entity<T> {
  /** The unique identifier for this entity. */
  protected readonly _id: T;

  /**
   * Create a new entity with the specified identifier.
   * @param id - The unique identifier for this entity
   */
  protected constructor(id: T) {
    this._id = id;
  }

  /**
   * Get the unique identifier of this entity.
   * @returns The entity's identifier
   */
  get id(): T {
    return this._id;
  }

  /**
   * Compare this entity with another by identity.
   *
   * @param other - The entity to compare against
   * @returns True if both entities have the same identity
   */
  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }
}
