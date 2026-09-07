import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("fabrice");

    const product = await db
      .collection("products")
      .findOne({ id: productId });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      category: product.category,
      gender: product.gender,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      description: product.description,
      sizes: product.sizes,
      ...(product.badge
        ? { badge: product.badge }
        : {}),
    });
  } catch (error) {
    console.error(
      "Product API error:",
      error
    );

    return NextResponse.json(
      { message: "Unable to load product." },
      { status: 500 }
    );
  }
}