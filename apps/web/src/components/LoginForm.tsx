'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input } from '@pgm/ui';
import { useAuth } from '@/hooks/useAuth';
import { ApiRequestError } from '@/lib/api';

type FieldErrors = Partial<Record<'email' | 'password', string>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, redirectTo, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      await login({ email, password });
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setFormError(err.message);
        if (err.errors) {
          setFieldErrors({
            email: err.errors.email?.[0],
            password: err.errors.password?.[0],
          });
        }
      } else {
        setFormError('Could not connect to the server. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={submitting}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={submitting}
      />

      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {formError}
        </div>
      ) : null}

      <Button type="submit" disabled={submitting} className="mt-2">
        {submitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
