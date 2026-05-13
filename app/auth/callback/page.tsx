import { Suspense } from 'react';
import { CallbackClient } from './CallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Autenticando...</p>
      </div>
    }>
      <CallbackClient />
    </Suspense>
  );
}
