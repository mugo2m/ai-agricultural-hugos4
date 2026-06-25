'use client';

import { useSearchParams } from 'next/navigation';

export default function VerifyContent() {
  const searchParams = useSearchParams();
  // Put all your existing page logic here (the code that uses searchParams)
  // For example:
  const status = searchParams.get('status');
  const reference = searchParams.get('reference');

  return (
    <div>
      <h1>Payment Verification</h1>
      <p>Status: {status}</p>
      <p>Reference: {reference}</p>
      {/* Rest of your page content */}
    </div>
  );
}