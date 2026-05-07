import { Suspense } from 'react';
import { Card } from '@pgm/ui';
import { LoginForm } from '@/components/LoginForm';

export const metadata = {
  title: 'Sign in - PGM App',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your PGM account</p>
        </div>

        <Card className="shadow-md">
          <Suspense fallback={<div className="py-6 text-center text-gray-500">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-500">
          Protected by Laravel Sanctum + JWT
        </p>
      </div>
    </main>
  );
}
