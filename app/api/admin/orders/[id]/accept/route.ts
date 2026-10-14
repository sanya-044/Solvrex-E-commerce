import { getAdminSession } from "@/lib/admin-auth";
import { handleAdminOrderDecision } from "@/lib/order-decisions";
import { getOrdersCollection } from "@/lib/orders-db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  return handleAdminOrderDecision(request, id, "accept", {
    getAdmin: getAdminSession,
    getOrders: getOrdersCollection,
  });
}
