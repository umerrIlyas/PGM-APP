import * as React from 'react';
import { cn } from '@pgm/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center rounded-lg font-medium border border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500';

const variantClass: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
