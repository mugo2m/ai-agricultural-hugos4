import { NextRequest, NextResponse } from 'next/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reference, amount, currency, email, phone, name } = body;

    if (action === 'initialize') {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: currency || 'KES', // ✅ Use currency from request
          email,
          phone,
          reference: reference || `farm-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`,
          metadata: {
            name,
            custom_fields: [
              { display_name: "Farmer", variable_name: "farmer", value: name },
            ],
          },
        }),
      });

      const data = await response.json();
      if (data.status) {
        return NextResponse.json({ status: 'success', data: data.data });
      } else {
        return NextResponse.json({ status: 'error', message: data.message }, { status: 400 });
      }
    }

    if (action === 'verify') {
      if (!reference) {
        return NextResponse.json({ status: 'error', message: 'Missing reference' }, { status: 400 });
      }

      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const data = await response.json();
      if (data.status && data.data.status === 'success') {
        return NextResponse.json({ status: 'success', data: data.data });
      } else {
        return NextResponse.json({ status: 'error', message: 'Payment not successful' }, { status: 400 });
      }
    }

    return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Paystack API error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}