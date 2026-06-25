"use client";

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  currency: string; // e.g., 'KES', 'UGX', 'TZS', 'EUR'
  email: string;
  phone: string;
  name: string;
  tx_ref?: string;
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

export function FlutterwavePaymentModal({
  isOpen,
  onClose,
  onSuccess,
  amount,
  currency,
  email,
  phone,
  name,
  tx_ref,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Flutterwave script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.FlutterwaveCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initialize',
          amount,
          currency,
          email,
          phone,
          name,
          tx_ref: tx_ref || `farm-${Date.now()}`,
        }),
      });
      const result = await response.json();

      if (result.status === 'success') {
        // Use Flutterwave inline checkout
        window.FlutterwaveCheckout({
          public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
          tx_ref: result.data.tx_ref,
          amount: result.data.amount,
          currency: result.data.currency,
          payment_options: 'card, mobilemoney, banktransfer, ussd',
          redirect_url: result.data.redirect_url,
          customer: {
            email: result.data.customer.email,
            phonenumber: result.data.customer.phonenumber,
            name: result.data.customer.name,
          },
          customizations: result.data.customizations,
          callback: (response: any) => {
            // Verify after successful payment
            verifyPayment(response.transaction_id);
          },
          onclose: () => {
            setLoading(false);
          },
        });
      } else {
        setError(result.message || 'Failed to initialize payment');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch('/api/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', transaction_id: transactionId }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        onSuccess();
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Pay with Flutterwave</h2>
        <p className="text-gray-600 mb-4">
          Amount: <span className="font-bold">{currency} {amount.toFixed(2)}</span>
        </p>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Pay Now'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}