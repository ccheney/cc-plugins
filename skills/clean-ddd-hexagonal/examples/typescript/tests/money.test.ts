// tests/domain/shared/money.test.ts
import { Money } from '@/domain/shared/money';
import { InvalidMoneyError, CurrencyMismatchError } from '@/domain/shared/errors';

describe('Money', () => {
  describe('create', () => {
    it('creates money with valid amount', () => {
      const money = Money.create(10.50, 'USD');

      expect(money.amount).toBe(10.50);
      expect(money.currency).toBe('USD');
    });

    it('throws for negative amount', () => {
      expect(() => Money.create(-1, 'USD')).toThrow(InvalidMoneyError);
    });
  });

  describe('add', () => {
    it('adds two money values with same currency', () => {
      const a = Money.create(10, 'USD');
      const b = Money.create(20, 'USD');

      const result = a.add(b);

      expect(result.amount).toBe(30);
      expect(result.currency).toBe('USD');
    });

    it('throws for different currencies', () => {
      const usd = Money.create(10, 'USD');
      const eur = Money.create(10, 'EUR');

      expect(() => usd.add(eur)).toThrow(CurrencyMismatchError);
    });
  });

  describe('equality', () => {
    it('equals money with same amount and currency', () => {
      const a = Money.create(10, 'USD');
      const b = Money.create(10, 'USD');

      expect(a.equals(b)).toBe(true);
    });

    it('not equal with different amount', () => {
      const a = Money.create(10, 'USD');
      const b = Money.create(20, 'USD');

      expect(a.equals(b)).toBe(false);
    });
  });
});
