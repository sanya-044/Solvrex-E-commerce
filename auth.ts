import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import clientPromise from "@/lib/mongodb";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  providers: [
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
          // Connect to MongoDB
          const client = await clientPromise;

          const db = client.db("VELMORI");

          const users = db.collection("users");

          // Find user by email
          const user = await users.findOne({
            email,
          });

          if (!user) {
            return null;
          }

          // Check password against bcrypt hash
          const passwordValid =
            typeof user.password === "string"
              ? await bcrypt.compare(
                  password,
                  user.password
                )
              : false;

          if (!passwordValid) {
            return null;
          }

          // Return user information to Auth.js
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error(
            "Authentication error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});