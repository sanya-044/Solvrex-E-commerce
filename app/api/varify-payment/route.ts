 import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is missing." }, { status: 400 });
    }

    // Verify signature if Razorpay details are provided
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY || "";
      const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ success: false, message: "Payment signature mismatch." }, { status: 400 });
      }
    }

    const client = await clientPromise;
    const db = client.db("fabrice");

    // Update the order status to PAID in MongoDB
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status: "PAID", // Change this to "PAID" so it displays correctly on the admin side
          razorpayPaymentId: razorpay_payment_id || null,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payment verified and order updated." });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 });
  }
}