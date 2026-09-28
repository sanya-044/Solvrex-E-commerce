import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const adminSecretKey = process.env.ADMIN_KEY;
    if (!adminSecretKey) {
      console.error("ADMIN_KEY environment variable is not configured.");
      return NextResponse.json(
        { message: "Admin registration is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const adminKey = body.adminKey?.trim();

    if (!name || !email || !password || !adminKey) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (adminKey !== adminSecretKey) {
      return NextResponse.json(
        { message: "Invalid admin authorization key." },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("VELMORI");
    const admins = db.collection("admins");

    const existingAdmin = await admins.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: "An admin account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await admins.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Admin account created successfully.", adminId: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
