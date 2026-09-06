 import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const password = body.password;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          message: "Name, email, phone number, and password are required.",
        },
        { status: 400 }
      );
    }

    // Validate strict 10-digit phone number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          message: "Phone number must be exactly 10 numeric digits.",
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        {
          message: "Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("fabrice");
    const users = db.collection("users");

    // Check if user already exists by email
    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Check if user already exists by phone number
    const existingPhone = await users.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        {
          message: "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user including phone
    const result = await users.insertOne({
      name,
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}