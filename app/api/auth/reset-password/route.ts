import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Invalid reset link." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Please enter a new password." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const client = await clientPromise;
    const db = client.db("fabrice");

    const resetToken =
      await db.collection("passwordResetTokens").findOne({
        tokenHash,
        expiresAt: {
          $gt: new Date(),
        },
      });

    if (!resetToken) {
      return NextResponse.json(
        {
          message:
            "This reset link is invalid or has expired.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection("users").updateOne(
      {
        _id: resetToken.userId,
      },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User account not found." },
        { status: 404 }
      );
    }

    // Token can never be reused
    await db.collection("passwordResetTokens").deleteOne({
      _id: resetToken._id,
    });

    return NextResponse.json({
      message: "Password successfully reset.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      {
        message:
          "Unable to reset password. Please try again.",
      },
      { status: 500 }
    );
  }
}