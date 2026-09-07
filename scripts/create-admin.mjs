import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing.");
}

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_PASSWORD are required."
  );
}

if (password.length < 8) {
  throw new Error(
    "ADMIN_PASSWORD must be at least 8 characters."
  );
}

const client = new MongoClient(uri);

try {
  await client.connect();

  const db = client.db("fabrice");
  const admins = db.collection("admins");

  const existingAdmin = await admins.findOne({ email });

  if (existingAdmin) {
    console.log("Admin account already exists.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await admins.insertOne({
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`Admin account created: ${email}`);
} finally {
  await client.close();
}