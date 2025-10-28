
// // app/api/paypal/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { getAccessToken } from '@/lib/paypal';

// export async function GET(req: NextRequest) {
//   const amount = req.nextUrl.searchParams.get('amount');

//   if (!amount) {
//     return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
//   }

//   try {
//     const accessToken = await getAccessToken();

//     const res = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         intent: 'CAPTURE',
//         purchase_units: [
//           {
//             amount: {
//               currency_code: 'USD',
//               value: amount,
//             },
//           },
//         ],
//         application_context: {
//           return_url: `${process.env.BASE_URL}/api/paypal/capture`,
//           cancel_url: `${process.env.BASE_URL}/cancel`,
//         },
//       }),
//     });

//     const data = await res.json();
//     const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

//     if (!approvalUrl) {
//       return NextResponse.json({ error: 'Approval URL not found' }, { status: 500 });
//     }

//     return NextResponse.redirect(approvalUrl);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
//   }
// }









// the aboe might hae worked, th ebelow is when i wanted to deploy to ercel , and got typesrip eslint error

// app/api/paypal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/paypal';
import { workerData } from 'worker_threads'

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface PayPalOrderResponse {
  id: string;
  links: PayPalLink[];
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  const amount = req.nextUrl.searchParams.get('amount');

  if (!amount) {
    return NextResponse.json({ error: 'Missing amount' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();

    const res = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
        application_context: {
          return_url: `${process.env.BASE_URL}/api/paypal/capture`,
          cancel_url: `${process.env.BASE_URL}/cancel`,
        },
      }),
    });

    const data: PayPalOrderResponse = await res.json();
    const approvalUrl = data.links.find((link) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return NextResponse.json({ error: 'Approval URL not found' }, { status: 500 });
    }

    return NextResponse.redirect(approvalUrl);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
