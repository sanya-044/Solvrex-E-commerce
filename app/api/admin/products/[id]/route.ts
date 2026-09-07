import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Verify admin session
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    // 2. Get product ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    // 3. Read request body
    const body = await request.json();

    const {
      name,
      category,
      gender,
      price,
      originalPrice,
      image,
      description,
      sizes,
      badge,
    } = body;

    // 4. Validate required fields
    if (
      !name ||
      !category ||
      !gender ||
      price === undefined ||
      originalPrice === undefined ||
      !image ||
      !description ||
      !Array.isArray(sizes) ||
      sizes.length === 0
    ) {
      return NextResponse.json(
        {
          message:
            "All required product fields must be provided.",
        },
        { status: 400 }
      );
    }

    // 5. Validate numeric values
    const numericPrice = Number(price);
    const numericOriginalPrice =
      Number(originalPrice);

    if (
      !Number.isFinite(numericPrice) ||
      !Number.isFinite(numericOriginalPrice) ||
      numericPrice < 0 ||
      numericOriginalPrice < 0
    ) {
      return NextResponse.json(
        { message: "Invalid product price." },
        { status: 400 }
      );
    }

    // 6. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("fabrice");

    const products =
      db.collection("products");

    // 7. Update product
    let result;

    // Your migrated products currently use numeric IDs.
    // Support numeric IDs first.
    const numericId = Number(id);

    if (Number.isInteger(numericId)) {
      result = await products.updateOne(
        { id: numericId },
        {
          $set: {
            name: String(name).trim(),
            category: String(category).trim(),
            gender: String(gender).trim(),
            price: numericPrice,
            originalPrice:
              numericOriginalPrice,
            image: String(image).trim(),
            description:
              String(description).trim(),
            sizes: sizes.map((size) =>
              String(size).trim()
            ),
            ...(badge
              ? {
                  badge: String(badge).trim(),
                }
              : {}),
            updatedAt: new Date(),
          },
        }
      );
    } else if (ObjectId.isValid(id)) {
      result = await products.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: String(name).trim(),
            category: String(category).trim(),
            gender: String(gender).trim(),
            price: numericPrice,
            originalPrice:
              numericOriginalPrice,
            image: String(image).trim(),
            description:
              String(description).trim(),
            sizes: sizes.map((size) =>
              String(size).trim()
            ),
            ...(badge
              ? {
                  badge: String(badge).trim(),
                }
              : {}),
            updatedAt: new Date(),
          },
        }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully.",
    });
  } catch (error) {
    console.error(
      "Admin product update error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update product.",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    // 1. Verify admin session
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    // 2. Get product ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required." },
        { status: 400 }
      );
    }

    // 3. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("fabrice");

    const products =
      db.collection("products");

    const numericId = Number(id);

    let result;

    // 4. Delete numeric-ID product
    if (Number.isInteger(numericId)) {
      result = await products.deleteOne({
        id: numericId,
      });
    } else if (ObjectId.isValid(id)) {
      // 5. Delete ObjectId product if applicable
      result = await products.deleteOne({
        _id: new ObjectId(id),
      });
    } else {
      return NextResponse.json(
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    // 6. Check result
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin product delete error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete product.",
      },
      { status: 500 }
    );
  }
}