import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { defaultProducts } from "@/data/products";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("VELMORI");

    const products = await db
      .collection("products")
      .find({})
      .sort({ id: 1 })
      .toArray();

    if (!products || products.length === 0) {
      return NextResponse.json(defaultProducts);
    }

    const formattedProducts = products.map((product) => ({
      id: Number(product.id),
      name: String(product.name || ""),
      category: String(product.category || ""),
      gender: String(product.gender || ""),
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || 0),
      image: String(product.image || ""),
      description: String(product.description || ""),
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      ...(product.badge ? { badge: String(product.badge) } : {}),
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Public products API fallback:", error);
    return NextResponse.json(defaultProducts);
  }
}