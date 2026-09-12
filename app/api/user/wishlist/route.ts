import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();
  const userWishlist = await db.collection("wishlists").findOne({ email: session.user.email });

  return NextResponse.json(userWishlist?.items || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();
  const client = await clientPromise;
  const db = client.db();

  await db.collection("wishlists").updateOne(
    { email: session.user.email },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}