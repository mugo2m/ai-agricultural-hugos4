import { NextRequest, NextResponse } from 'next/server';

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transaction_id, amount, currency, email, phone, name, tx_ref } = body;

    // 1. Initialize transaction
    if (action === 'initialize') {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: tx_ref || `farm-${Date.now()}`,
          amount,
          currency,
          redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/verify`,
          customer: {
            email,
            phonenumber: phone,
            name,
          },
          customizations: {
            title: 'Hugos Smart Farmer AI',
            description: 'Access your personalized farm recommendations',
            logo: 'https://your-logo-url.com/logo.png',
          },
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        return NextResponse.json({ status: 'success', data: data.data });
      } else {
        return NextResponse.json({ status: 'error', message: data.message }, { status: 400 });
      }
    }

    // 2. Verify transaction
    if (action === 'verify') {
      if (!transaction_id) {
        return NextResponse.json({ status: 'error', message: 'Missing transaction_id' }, { status: 400 });
      }

      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        headers: { 'Authorization': `Bearer ${FLW_SECRET_KEY}` },
      });
      const data = await response.json();
      if (data.status === 'success' && data.data.status === 'successful') {
        return NextResponse.json({ status: 'success', data: data.data });
      } else {
        return NextResponse.json({ status: 'error', message: 'Payment not successful' }, { status: 400 });
      }
    }

    return NextResponse.json({ status: 'error', message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Flutterwave API error:', error);
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}