'use client';

import { Button } from '@pgm/ui';
import type { PaginationMeta } from '@/types/api';

type PaginationProps = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, last_page, total, per_page } = meta;
  const start = total === 0 ? 0 : (current_page - 1) * per_page + 1;
  const end = Math.min(current_page * per_page, total);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
      <p className="text-sm text-gray-600">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium">{start}</span>-
            <span className="font-medium">{end}</span> of{' '}
            <span className="font-medium">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page <span className="font-medium">{current_page}</span> of{' '}
          <span className="font-medium">{last_page}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
