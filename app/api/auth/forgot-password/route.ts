import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { Resend } from "resend";

import clientPromise from "@/lib/mongodb";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const client = await clientPromise;
    const db = client.db("fabrice");

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    /*
     * Don't reveal whether an email exists.
     * The UI will show the same message either way.
     */
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists for this email, a reset link has been sent.",
      });
    }

    // Generate secure random token
    const rawToken = randomBytes(32).toString("hex");

    // Store only the hash in MongoDB
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Remove any previous reset tokens for this user
    await db.collection("passwordResetTokens").deleteMany({
      userId: user._id,
    });

    await db.collection("passwordResetTokens").insertOne({
      userId: user._id,
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    const appUrl =
      process.env.APP_URL || "http://localhost:3000";

    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const { error } = await resend.emails.send({
      from: "FABRICE <onboarding@resend.dev>",
      to: [normalizedEmail],
      subject: "Reset your FABRICE password",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f5f3ee; padding:40px 20px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; padding:40px;">
            
            <h1 style="font-size:28px; margin:0 0 10px; letter-spacing:-1px;">
              FABRICE
            </h1>

            <p style="color:#666; font-size:13px; margin-bottom:30px;">
              Password Reset
            </p>

            <h2 style="font-size:22px;">
              Reset your password
            </h2>

            <p style="font-size:14px; line-height:1.7; color:#444;">
              We received a request to reset the password for your FABRICE
              account.
            </p>

            <p style="font-size:14px; line-height:1.7; color:#444;">
              Click the button below to create a new password.
            </p>

            <div style="margin:30px 0;">
              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  background:#000;
                  color:#fff;
                  padding:15px 25px;
                  text-decoration:none;
                  font-size:12px;
                  font-weight:bold;
                  letter-spacing:1px;
                "
              >
                RESET PASSWORD
              </a>
            </div>

            <p style="font-size:12px; line-height:1.6; color:#777;">
              This link will expire in 1 hour.
            </p>

            <p style="font-size:12px; line-height:1.6; color:#777;">
              If you did not request a password reset, you can safely ignore
              this email.
            </p>

          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      // Remove token if email could not be sent
      await db.collection("passwordResetTokens").deleteOne({
        tokenHash,
      });

      return NextResponse.json(
        { message: "Unable to send reset email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}