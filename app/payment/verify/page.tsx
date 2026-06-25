// app/payment/verify/page.tsx
import { Suspense } from 'react';
import PaymentVerifyContent from './PaymentVerifyContent';

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<div>Loading payment verification...</div>}>
      <PaymentVerifyContent />
    </Suspense>
  );
}