import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("fabrice");

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      products.map((product) => ({
        ...product,
        _id: product._id.toString(),
      }))
    );
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      { message: "Unable to load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "";

    const gender =
      typeof body.gender === "string"
        ? body.gender.trim()
        : "";

    const price = Number(body.price);
    const originalPrice = Number(body.originalPrice);

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const sizes = Array.isArray(body.sizes)
      ? body.sizes.filter(
          (size: unknown): size is string =>
            typeof size === "string" &&
            size.trim().length > 0
        )
      : [];

    const badge =
      typeof body.badge === "string"
        ? body.badge.trim()
        : "";

    if (
      !name ||
      !category ||
      !gender ||
      !image ||
      !description ||
      !Number.isFinite(price) ||
      !Number.isFinite(originalPrice) ||
      sizes.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "Please provide all required product fields.",
        },
        { status: 400 }
      );
    }

    if (price <= 0 || originalPrice <= 0) {
      return NextResponse.json(
        {
          message:
            "Prices must be greater than zero.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("fabrice");

    const productsCollection =
      db.collection("products");

    const latestProduct =
      await productsCollection
        .find({})
        .sort({ id: -1 })
        .limit(1)
        .next();

    const nextId = latestProduct?.id
      ? Number(latestProduct.id) + 1
      : 1;

    const product = {
      id: nextId,
      name,
      category,
      gender,
      price,
      originalPrice,
      image,
      description,
      sizes,
      ...(badge ? { badge } : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result =
      await productsCollection.insertOne(
        product
      );

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product: {
          ...product,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Products POST error:", error);

    return NextResponse.json(
      { message: "Unable to create product." },
      { status: 500 }
    );
  }
}