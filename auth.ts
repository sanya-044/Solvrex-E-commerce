 import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) return null;

        try {
          const client = await clientPromise;
          const db = client.db("VELMORI");
          const user = await db.collection("users").findOne({ email });

          if (!user) return null;

          const passwordValid =
            typeof user.password === "string"
              ? await bcrypt.compare(password, user.password)
              : false;

          if (!passwordValid) return null;

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" && user.email) {
          const client = await clientPromise;
          const db = client.db("VELMORI");
          const users = db.collection("users");
          const email = user.email.trim().toLowerCase();

          const existingUser = await users.findOne({ email });

          if (!existingUser) {
            await users.insertOne({
              email,
              name: user.name || "Google User",
              image: user.image || null,
              provider: "google",
              role: "user", // Default role for new Google signups
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            await users.updateOne(
              { email },
              {
                $set: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image || null,
                  updatedAt: new Date(),
                },
              }
            );
          }
        }
        return true;
      } catch (error) {
        console.error("Google authentication error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // If user is present (sign-in event), store user ID
      if (user) {
        token.id = user.id;
      }

      // Always check database using token.email so both Credentials & Google 
      // sessions securely fetch the most up-to-date role from MongoDB
      if (token?.email) {
        try {
          const client = await clientPromise;
          const db = client.db("VELMORI");
          const dbUser = await db.collection("users").findOne({ email: token.email });
          token.role = (dbUser?.role as string) || "user";
        } catch (error) {
          console.error("JWT role fetch error:", error);
          token.role = token.role || "user";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});