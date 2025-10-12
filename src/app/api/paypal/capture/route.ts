
// app/api/paypal/capture/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/paypal';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token'); // PayPal sends this in query

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();

    const res = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    return NextResponse.redirect(`${process.env.BASE_URL}/success?paymentId=${data.id}`);
  } catch (err) {
    console.error('Capture error:', err);
    return NextResponse.redirect(`${process.env.BASE_URL}/cancel`);
  }
}
