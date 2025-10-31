
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

export async function POST(req: Request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const {
      user, // { name, email, phone }
      sellerEmail,
      serviceTitle,
      selectedPackage,
      selectedDate,
      selectedSlot,
      priceAED,
      status, // e.g. "IN PROGRESS", "COMPLETED"
      paymentStatus, // e.g. "PAID", "NOT YET PAID"
    } = await req.json();

    if (!user?.email || !serviceTitle) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Missing required fields." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // === Email transporter ===
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
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

    const emailStyle = `
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      border: 1px solid #ddd;
      border-radius: 10px;
      padding: 20px;
      background-color: #f9f9f9;
    `;

    // === Buyer Email ===
    const buyerMail = {
      from: `"MACO" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Booking Update – ${serviceTitle}`,
      html: `
        <div style="${emailStyle}">
          <h2 style="color:#119458;">Hello ${user.name},</h2>
          <p>Your booking has been updated.</p>
          <ul>
            <li><strong>Service:</strong> ${serviceTitle}</li>
            <li><strong>Package:</strong> ${selectedPackage?.name || "N/A"}</li>
            <li><strong>Date:</strong> ${selectedDate}</li>
            <li><strong>Time Slot:</strong> ${selectedSlot}</li>
            <li><strong>Price:</strong> AED ${priceAED}</li>
            <li><strong>Status:</strong> ${status}</li>
            <li><strong>Payment Status:</strong> ${paymentStatus}</li>
          </ul>
          <br/>
          <p>Thank you for choosing MACO.</p>
          <p>Email: matthewcarwashandcleaning20@gmail.com</p>
            <p>Phone: +971 56 830 7510</p>
        </div>
      `,
    };

    // === Seller Email ===
    const sellerMail = {
      from: `"MACO" <${process.env.EMAIL_USER}>`,
      to: sellerEmail,
      subject: `Booking Status Update – ${user.name}`,
      html: `
        <div style="${emailStyle}">
          <h2 style="color:#119458;">Booking Update</h2>
          <p><strong>Customer:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone:</strong> ${user.phone || "N/A"}</p>
          <ul>
            <li><strong>Service:</strong> ${serviceTitle}</li>
            <li><strong>Package:</strong> ${selectedPackage?.name || "N/A"}</li>
            <li><strong>Date:</strong> ${selectedDate}</li>
            <li><strong>Time Slot:</strong> ${selectedSlot}</li>
            <li><strong>Price:</strong> AED ${priceAED}</li>
            <li><strong>Status:</strong> ${status}</li>
            <li><strong>Payment Status:</strong> ${paymentStatus}</li>
          </ul>
           <br/>
          <p>Thank you for choosing MACO.</p>
          <p>Email: matthewcarwashandcleaning20@gmail.com</p>
            <p>Phone: +971 56 830 7510</p>
        </div>
      `,
    };

    // === Send both emails ===
    await Promise.all([
      transporter.sendMail(buyerMail),
      transporter.sendMail(sellerMail),
    ]);

    return new NextResponse(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error sending booking update emails:", error);
    return new NextResponse(
      JSON.stringify({ success: false, error: "Email failed to send" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}
