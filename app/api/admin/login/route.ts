import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";
import { createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const db = client.db("fabrice");

    const admins = db.collection("admins");

    const admin = await admins.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Invalid admin credentials.",
        },
        { status: 401 }
      );
    }

    const passwordValid =
      typeof admin.password === "string"
        ? await bcrypt.compare(
            password,
            admin.password
          )
        : false;

    if (!passwordValid) {
      return NextResponse.json(
        {
          message: "Invalid admin credentials.",
        },
        { status: 401 }
      );
    }

    await createAdminSession(
      admin._id.toString(),
      admin.email
    );

    return NextResponse.json(
      {
        message: "Admin login successful.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}