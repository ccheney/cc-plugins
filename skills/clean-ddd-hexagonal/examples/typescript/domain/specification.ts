// domain/shared/specification.ts
export interface ISpecification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: ISpecification<T>): ISpecification<T>;
  or(other: ISpecification<T>): ISpecification<T>;
  not(): ISpecification<T>;
}

export abstract class Specification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

// domain/order/specifications.ts
export class OrderOverValueSpec extends Specification<Order> {
  constructor(private readonly minValue: Money) {}

  isSatisfiedBy(order: Order): boolean {
    return order.total.amount >= this.minValue.amount;
  }
}

export class OrderHasItemsSpec extends Specification<Order> {
  isSatisfiedBy(order: Order): boolean {
    return order.items.length > 0;
  }
}

// Usage
// const canShipFree = new OrderOverValueSpec(Money.create(100, 'USD'))
//   .and(new OrderHasItemsSpec());
//
// if (canShipFree.isSatisfiedBy(order)) {
//   // Apply free shipping
// }
