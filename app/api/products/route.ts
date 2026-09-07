import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db("fabrice");

    const products = await db
      .collection("products")
      .find({})
      .sort({ id: 1 })
      .toArray();

    const formattedProducts = products.map(
      (product) => ({
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
      })
    );

    return NextResponse.json(
      formattedProducts
    );
  } catch (error) {
    console.error(
      "Public products API error:",
      error
    );

    return NextResponse.json(
      {
        message: "Unable to load products.",
      },
      { status: 500 }
    );
  }
}