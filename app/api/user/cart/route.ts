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
  const userCart = await db.collection("carts").findOne({ email: session.user.email });

  return NextResponse.json(userCart?.items || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();
  const client = await clientPromise;
  const db = client.db();

  await db.collection("carts").updateOne(
    { email: session.user.email },
    { $set: { items, updatedAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}