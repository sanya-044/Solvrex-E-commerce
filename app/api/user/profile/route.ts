import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function PUT(request: Request) {
  try {
    // 1. Check whether user is logged in
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // 2. Get data from request
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    // 3. Required fields validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        {
          message: "Name, email and phone number are required.",
        },
        { status: 400 }
      );
    }

    // 4. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // 5. Validate phone
    const phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        {
          message: "Phone number must be exactly 10 numeric digits.",
        },
        { status: 400 }
      );
    }

    // 6. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("VELMORI");
    const users = db.collection("users");

    // 7. Get logged-in user's ID from session
    let userId: ObjectId;

    try {
      userId = new ObjectId(session.user.id);
    } catch {
      return NextResponse.json(
        {
          message: "Invalid user ID.",
        },
        { status: 400 }
      );
    }

    // 8. Check if another user already has this email
    const existingEmail = await users.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // 9. Check if another user already has this phone number
    const existingPhone = await users.findOne({
      phone,
      _id: { $ne: userId },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          message: "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    // 10. Update the logged-in user's profile
    const result = await users.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          email,
          phone,
          updatedAt: new Date(),
        },
      }
    );

    // 11. User not found
    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // 12. Success
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while updating the profile.",
      },
      { status: 500 }
    );
  }
}