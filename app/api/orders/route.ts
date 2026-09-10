 import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import Razorpay from "razorpay";

// Initialize Razorpay with fallback support for both key naming conventions
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY || "",
});

type OrderItem = {
  product?: {
    id?: number | string;
    name?: string;
    price?: number | string;
    image?: string;
  };
  size?: string;
  quantity?: number | string;
};

export async function POST(request: Request) {
  try {
    // Verify customer login
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must be logged in to place an order." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      items,
      customer,
      shippingAddress,
      subtotal,
      shipping,
      total,
      paymentMethod,
    } = body;

    // Basic validation
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { message: "Customer information is incomplete." },
        { status: 400 }
      );
    }

    if (
      !shippingAddress?.address ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.pincode
    ) {
      return NextResponse.json(
        { message: "Shipping address is incomplete." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(Number(subtotal)) ||
      !Number.isFinite(Number(shipping)) ||
      !Number.isFinite(Number(total))
    ) {
      return NextResponse.json(
        { message: "Invalid order amount." },
        { status: 400 }
      );
    }

    // If online payment is selected, create a Razorpay order first
    let razorpayOrderId = null;
    if (paymentMethod === "ONLINE") {
      try {
        const options = {
          amount: Math.round(Number(total) * 100), // Amount in paise (e.g. ₹899 = 89900)
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        };
        const razorpayOrder = await razorpay.orders.create(options);
        razorpayOrderId = razorpayOrder.id;
      } catch (razorpayErr) {
        console.error("Razorpay order creation failed:", razorpayErr);
        return NextResponse.json(
          { message: "Failed to initialize online payment order with Razorpay keys." },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db("fabrice");

    const order = {
      userId: new ObjectId(session.user.id),
      orderNumber: Math.floor(100000 + Math.random() * 900000).toString(),

      items: (items as OrderItem[]).map((item) => ({
        productId: item.product?.id,
        name: item.product?.name,
        price: Number(item.product?.price),
        image: item.product?.image,
        size: item.size,
        quantity: Number(item.quantity),
      })),

      customer: {
        name: String(customer.name).trim(),
        email: String(customer.email).trim().toLowerCase(),
        phone: String(customer.phone).trim(),
      },

      shippingAddress: {
        address: String(shippingAddress.address).trim(),
        city: String(shippingAddress.city).trim(),
        state: String(shippingAddress.state).trim(),
        pincode: String(shippingAddress.pincode).trim(),
      },

      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),

      paymentMethod: paymentMethod || "COD",
      status: paymentMethod === "ONLINE" ? "pending_payment" : "placed",
      razorpayOrderId: razorpayOrderId || null,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    return NextResponse.json(
      {
        message: "Order initialized successfully.",
        orderId: result.insertedId.toString(),
        razorpayOrderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        message: "Unable to place your order.",
      },
      { status: 500 }
    );
  }
}