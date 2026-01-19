// shared/ui/Button/Button.tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';

/**
 * Props for the Button component.
 *
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button. */
  variant?: 'primary' | 'secondary' | 'ghost';

  /** Size preset affecting padding and font size. */
  size?: 'sm' | 'md' | 'lg';

  /** When true, displays a loading state and disables interaction. */
  loading?: boolean;
}

/**
 * A versatile button component with multiple style variants and sizes.
 *
 * @remarks
 * Supports all native button attributes via prop spreading. Uses `forwardRef`
 * to allow parent components to access the underlying button element.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Submit
 * </Button>
 *
 * <Button variant="ghost" loading>
 *   Processing...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      ghost: 'bg-transparent hover:bg-gray-100',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md font-medium transition-colors disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
