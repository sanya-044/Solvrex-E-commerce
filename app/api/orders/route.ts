import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
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
    console.log("ORDER CUSTOMER:", customer);
console.log("ORDER SHIPPING:", shippingAddress);
    // Basic validation
    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { message: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (
      !customer?.name ||
      !customer?.email ||
      !customer?.phone
    ) {
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

    const client = await clientPromise;
    const db = client.db("fabrice");

    const order = {
      userId: session.user.id,

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
        address: String(
          shippingAddress.address
        ).trim(),
        city: String(
          shippingAddress.city
        ).trim(),
        state: String(
          shippingAddress.state
        ).trim(),
        pincode: String(
          shippingAddress.pincode
        ).trim(),
      },

      subtotal: Number(subtotal),
      shipping: Number(shipping),
      total: Number(total),

      paymentMethod:
        paymentMethod || "COD",

      status: "placed",

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("orders")
      .insertOne(order);

    return NextResponse.json(
      {
        message: "Order placed successfully.",
        orderId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to place your order.",
      },
      { status: 500 }
    );
  }
}