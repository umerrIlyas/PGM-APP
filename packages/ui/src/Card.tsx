import * as React from 'react';
import { cn } from '@pgm/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm', className)}
      {...props}
    >
      {title ? <h3 className="mb-3 text-lg font-semibold">{title}</h3> : null}
      <div className="text-gray-700">{children}</div>
    </div>
  ),
);
Card.displayName = 'Card';
