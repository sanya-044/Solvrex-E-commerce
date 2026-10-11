import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

async function createTransparentImage(
  imageUrl: string,
  productName: string,
  productId: number
) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    throw new Error(
      "REMOVE_BG_API_KEY is not configured."
    );
  }

  const formData = new FormData();

  formData.append("image_url", imageUrl);
  formData.append("size", "auto");
  formData.append("format", "png");

  const response = await fetch(
    "https://api.remove.bg/v1.0/removebg",
    {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `remove.bg failed (${response.status}): ${errorText}`
    );
  }

  const pngBuffer = Buffer.from(
    await response.arrayBuffer()
  );

  /*
   * IMPORTANT:
   *
   * This example stores the generated PNG as a
   * data URL so it works immediately without adding
   * another storage provider.
   *
   * For production, move this to Cloudinary/S3/etc.
   */

  const base64 = pngBuffer.toString(
    "base64"
  );

  const transparentImage =
    `data:image/png;base64,${base64}`;

  return transparentImage;
}

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
    const db = client.db("VELMORI");

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
    console.error(
      "Products GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to load products.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body =
      await request.json();

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

    const originalPrice =
      Number(body.originalPrice);

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const sizes =
      Array.isArray(body.sizes)
        ? body.sizes.filter(
            (
              size: unknown
            ): size is string =>
              typeof size ===
                "string" &&
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

    if (
      price <= 0 ||
      originalPrice <= 0
    ) {
      return NextResponse.json(
        {
          message:
            "Prices must be greater than zero.",
        },
        { status: 400 }
      );
    }

    const client =
      await clientPromise;

    const db =
      client.db("VELMORI");

    const productsCollection =
      db.collection("products");

    const latestProduct =
      await productsCollection
        .find({})
        .sort({ id: -1 })
        .limit(1)
        .next();

    const nextId =
      latestProduct?.id
        ? Number(latestProduct.id) + 1
        : 1;

    /*
     * ==========================================
     * CREATE TRANSPARENT PNG
     * ==========================================
     */

    let transparentImage: string | null =
      null;

    try {
      transparentImage =
        await createTransparentImage(
          image,
          name,
          nextId
        );
    } catch (error) {
      console.error(
        "Transparent image generation failed:",
        error
      );

      /*
       * We DO NOT fail the product creation.
       *
       * The original product still gets saved.
       */

      transparentImage = null;
    }

    const product = {
      id: nextId,

      name,
      category,
      gender,

      price,
      originalPrice,

      image,

      /*
       * New field
       */
      transparentImage,

      description,
      sizes,

      ...(badge
        ? { badge }
        : {}),

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result =
      await productsCollection.insertOne(
        product
      );

    return NextResponse.json(
      {
        message:
          "Product created successfully.",

        product: {
          ...product,

          _id:
            result.insertedId.toString(),
        },

        transparentImageCreated:
          Boolean(
            transparentImage
          ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Products POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Unable to create product.",
      },
      { status: 500 }
    );
  }
}