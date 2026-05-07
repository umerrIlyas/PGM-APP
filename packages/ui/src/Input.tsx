import * as React from 'react';
import { cn } from '@pgm/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={inputId} className="text-sm text-gray-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'rounded-lg border border-gray-300 px-3 py-2 text-base outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {error ? <span className="text-xs text-red-500">{error}</span> : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
