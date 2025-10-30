

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const {
      user,             // { name, email, phone }
      sellerEmail,      // string
      serviceTitle,     // string
      selectedPackage,  // { name, price }
      priceAED,         // number or string
      priceUSD,         // number or string
      date,
      paymentStatus            // string
    } = await req.json();

    if (!user?.email || !sellerEmail || !serviceTitle) {
      return new NextResponse(JSON.stringify({ success: false, error: 'Missing required fields.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // === Email transporter with extended timeouts ===
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    // === Email to Buyer ===
    const buyerMail = {
      from: `"${serviceTitle}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your Order for ${serviceTitle}`,
      html: `
        <h2>Thank You, ${user.name}</h2>
        <p>You’ve successfully placed an order for the following package:</p>
        <ul>
          <li><strong>Package:</strong> ${selectedPackage.name}</li>
          <li><strong>Amount:</strong> AED ${priceAED} (~USD ${priceUSD})</li>
          <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
          <li><strong>Payment Status: ${paymentStatus}</strong></li>
        </ul>
        <p>We'll be in touch with the next steps soon. </p>
        <h3> MACO </h3>
      `,
    };

    // === Email to Seller ===
    const sellerMail = {
      from: `"${serviceTitle} Orders" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: `New Order Received for ${serviceTitle}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Buyer Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <p><strong>Package:</strong> ${selectedPackage.name}</p>
        <p><strong>Amount:</strong> AED ${priceAED} (~USD ${priceUSD})</p>
        <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
        <p><strong>Payment Status: ${paymentStatus}</strong></p>
      `,
    };

    // === Send both emails in parallel ===
    await Promise.all([
      transporter.sendMail(buyerMail),
      transporter.sendMail(sellerMail),
    ]);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error sending order emails:', error);
    return new NextResponse(JSON.stringify({ success: false, error: 'Email failed to send' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
