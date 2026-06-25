// app/payment/verify/PaymentVerifyContent.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (transactionId) {
      // You can also call the verify endpoint here as a fallback
      router.push('/');
    }
  }, [transactionId, router]);

  return <div>Verifying payment...</div>;
}