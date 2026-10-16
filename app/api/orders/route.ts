import { auth } from "@/auth";
import { handleCreateOrder } from "@/lib/order-create";
import { getOrdersCollection } from "@/lib/orders-db";
import Razorpay from "razorpay";

// Razorpay is created lazily, with fallback support for both key naming
// conventions, so importing this route never throws when keys are absent.
async function createRazorpayOrder(amountInPaise: number): Promise<string> {
  const razorpay = new Razorpay({
    key_id:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "",
    key_secret:
      process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_SECRET_KEY ||
      "",
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  return razorpayOrder.id;
}

export async function POST(request: Request) {
  return handleCreateOrder(request, {
    getUserId: async () => {
      // Verify customer login
      const session = await auth();
      return session?.user?.id ?? null;
    },
    createRazorpayOrder,
    getOrders: getOrdersCollection,
  });
}