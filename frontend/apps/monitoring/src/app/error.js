'use client';

import Button from '@ui/Button';

export default function RootError({ error, reset }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-bg-page px-4">
      <div className="w-full max-w-md rounded-lg border border-bg-border bg-bg-surface p-6 text-center shadow-card">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">Something went wrong</p>
        <h2 className="mt-2 text-2xl font-bold text-text-primary">Page could not render</h2>
        <p className="mt-3 text-sm text-text-secondary">
          {error?.message || 'Please retry. If it continues, check the backend URL and server status.'}
        </p>
        <Button onClick={reset} className="mt-5">
          Try again
        </Button>
      </div>
    </div>
  );
}
