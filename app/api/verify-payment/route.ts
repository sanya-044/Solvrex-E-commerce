import { auth } from "@/auth";
import { getOrdersCollection } from "@/lib/orders-db";
import { handleVerifyPayment } from "@/lib/payment-verification";

export async function POST(request: Request) {
  return handleVerifyPayment(request, {
    getUserId: async () => {
      const session = await auth();
      return session?.user?.id ?? null;
    },
    getOrders: getOrdersCollection,
    getSecret: () =>
      process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY || "",
  });
}
