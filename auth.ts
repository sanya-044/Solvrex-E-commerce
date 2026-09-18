import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
    // =========================================================
    // EMAIL + PASSWORD LOGIN
    // =========================================================
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
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

        if (!email || !password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("VELMORI");

          const users = db.collection("users");

          const user = await users.findOne({
            email,
          });

          if (!user) {
            return null;
          }

          const passwordValid =
            typeof user.password === "string"
              ? await bcrypt.compare(password, user.password)
              : false;

          if (!passwordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication error:", error);

          return null;
        }
      },
    }),

    // =========================================================
    // GOOGLE LOGIN
    // =========================================================
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  // =========================================================
  // SESSION
  // =========================================================
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  // =========================================================
  // CALLBACKS
  // =========================================================
  callbacks: {
    // ---------------------------------------------------------
    // Runs whenever a user signs in
    // ---------------------------------------------------------
    async signIn({ user, account }) {
      try {
        // Only handle Google users here
        if (account?.provider === "google" && user.email) {
          const client = await clientPromise;
          const db = client.db("VELMORI");

          const users = db.collection("users");

          const email = user.email.trim().toLowerCase();

          // Check whether this email already exists
          const existingUser = await users.findOne({
            email,
          });

          if (!existingUser) {
            // Create a new user for Google login
            await users.insertOne({
              email,
              name: user.name || "Google User",
              image: user.image || null,
              provider: "google",
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            console.log("Created Google user:", email);
          } else {
            // Update basic information without touching password
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

            console.log("Google user logged in:", email);
          }
        }

        return true;
      } catch (error) {
        console.error("Google authentication error:", error);

        return false;
      }
    },

    // ---------------------------------------------------------
    // JWT
    // ---------------------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    // ---------------------------------------------------------
    // SESSION
    // ---------------------------------------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});