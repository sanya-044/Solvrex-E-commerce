import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { ObjectId, type Collection, type Document, type WithId } from "mongodb";
import clientPromise from "@/lib/mongodb";

type GoogleProfileClaims = {
  email?: string | null;
  email_verified?: boolean | null;
  sub?: string | null;
};

type GoogleUserDetails = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseObjectId(value: unknown): ObjectId | null {
  if (typeof value !== "string" || !/^[0-9a-fA-F]{24}$/.test(value)) {
    return null;
  }

  return new ObjectId(value);
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function logGoogleSignIn(reason: string, details: Record<string, unknown> = {}) {
  console.info(
    "[auth][google-signin]",
    JSON.stringify({ reason, ...details })
  );
}

function getSafeErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return { errorType: typeof error };
  }

  const errorCode =
    "code" in error &&
    (typeof error.code === "number" || typeof error.code === "string")
      ? error.code
      : undefined;

  return {
    errorName:
      "name" in error && typeof error.name === "string"
        ? error.name
        : "UnknownError",
    ...(errorCode !== undefined ? { errorCode } : {}),
  };
}

function isGoogleProfileVerified(
  userEmail: GoogleUserDetails["email"],
  providerAccountId: string,
  profile: GoogleProfileClaims | undefined
) {
  return (
    profile?.email_verified === true &&
    typeof profile.email === "string" &&
    profile.email.trim().length > 0 &&
    typeof profile.sub === "string" &&
    profile.sub.length > 0 &&
    profile.sub === providerAccountId &&
    typeof userEmail === "string" &&
    normalizeEmail(userEmail) === normalizeEmail(profile.email)
  );
}

function hasSingleFieldKey(
  index: { key: Record<string, unknown> },
  field: string
) {
  return Object.keys(index.key).length === 1 && index.key[field] === 1;
}

function hasGoogleSubjectPartialFilter(
  filter: Document | undefined
) {
  const subjectFilter = filter?.googleSub;
  if (
    !subjectFilter ||
    typeof subjectFilter !== "object" ||
    Array.isArray(subjectFilter) ||
    Object.keys(filter ?? {}).length !== 1
  ) {
    return false;
  }

  const conditions = subjectFilter as Record<string, unknown>;
  return (
    Object.keys(conditions).length === 2 &&
    conditions.$type === "string" &&
    conditions.$gt === ""
  );
}

async function hasRequiredGoogleIndexes(users: Collection<Document>) {
  const indexes = await users.listIndexes().toArray();
  const emailIndexes = indexes.filter((index) =>
    hasSingleFieldKey(index, "email")
  );
  const googleSubIndexes = indexes.filter((index) =>
    hasSingleFieldKey(index, "googleSub")
  );

  const hasUniqueEmailIndex = emailIndexes.length === 1 &&
    emailIndexes.some(
    (index) =>
      index.unique === true &&
      index.sparse !== true &&
      !index.partialFilterExpression &&
      hasSingleFieldKey(index, "email")
  );
  const hasUniqueGoogleSubIndex = googleSubIndexes.length === 1 &&
    googleSubIndexes.some(
    (index) =>
      index.unique === true &&
      hasGoogleSubjectPartialFilter(index.partialFilterExpression)
  );

  return {
    allowed: hasUniqueEmailIndex && hasUniqueGoogleSubIndex,
    emailIndexCount: emailIndexes.length,
    hasUniqueEmailIndex,
    googleSubIndexCount: googleSubIndexes.length,
    hasUniqueGoogleSubIndex,
  };
}

async function resolveGoogleUser(
  users: Collection<Document>,
  email: string,
  googleSub: string,
  user: GoogleUserDetails
) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const [subjectMatches, emailMatches] = await Promise.all([
      users.find({ googleSub }).limit(2).toArray(),
      users.find({ email }).limit(2).toArray(),
    ]);

    if (subjectMatches.length > 1 || emailMatches.length > 1) {
      logGoogleSignIn("user_lookup_ambiguous", {
        attempt,
        googleSubjectMatchCount: subjectMatches.length,
        emailMatchCount: emailMatches.length,
      });
      return false;
    }

    const linkedUser = subjectMatches[0];
    const emailOwner = emailMatches[0];

    if (linkedUser) {
      if (!(linkedUser._id instanceof ObjectId)) {
        logGoogleSignIn("linked_user_invalid_mongodb_id", { attempt });
        return false;
      }
      if (
        emailOwner &&
        (!(emailOwner._id instanceof ObjectId) ||
          !emailOwner._id.equals(linkedUser._id))
      ) {
        logGoogleSignIn("linked_subject_email_conflict", { attempt });
        return false;
      }

      logGoogleSignIn("existing_google_subject_matched", { attempt });
      return true;
    }

    if (emailOwner) {
      const isUnlinkedLegacyGoogleUser =
        emailOwner.provider === "google" &&
        !("password" in emailOwner) &&
        !("googleSub" in emailOwner);

      if (!isUnlinkedLegacyGoogleUser || !(emailOwner._id instanceof ObjectId)) {
        logGoogleSignIn("email_owned_by_unlinkable_account", {
          attempt,
          isLegacyGoogleProvider: emailOwner.provider === "google",
          hasPassword: "password" in emailOwner,
          hasGoogleSubject: "googleSub" in emailOwner,
          hasValidMongoId: emailOwner._id instanceof ObjectId,
        });
        return false;
      }

      try {
        const result = await users.updateOne(
          {
            _id: emailOwner._id,
            email,
            provider: "google",
            password: { $exists: false },
            googleSub: { $exists: false },
          },
          {
            $set: {
              googleSub,
              updatedAt: new Date(),
            },
          }
        );

        if (result.matchedCount === 1) {
          logGoogleSignIn("legacy_google_subject_migrated", { attempt });
          return true;
        }

        logGoogleSignIn("legacy_google_migration_lost_race", {
          attempt,
          matchedCount: result.matchedCount,
        });
        continue;
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          logGoogleSignIn("legacy_google_migration_duplicate_key", {
            attempt,
            ...getSafeErrorDetails(error),
          });
          continue;
        }
        throw error;
      }
    }

    logGoogleSignIn("no_existing_subject_or_email_match", { attempt });
    try {
      await users.insertOne({
        email,
        name: user.name || "Google User",
        image: user.image || null,
        provider: "google",
        googleSub,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logGoogleSignIn("new_google_user_created", { attempt });
      return true;
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        logGoogleSignIn("new_google_user_duplicate_key", {
          attempt,
          ...getSafeErrorDetails(error),
        });
        continue;
      }
      throw error;
    }
  }

  logGoogleSignIn("user_resolution_retries_exhausted");
  return false;
}

const providers: NextAuthConfig["providers"] = [
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
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

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
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;
      const googleEmail = profile?.email;
      const verificationPassed = isGoogleProfileVerified(
        user.email,
        account.providerAccountId,
        profile
      );
      if (!verificationPassed || typeof googleEmail !== "string") {
        logGoogleSignIn("profile_verification_rejected", {
          hasProfile: Boolean(profile),
          emailVerified: profile?.email_verified === true,
          hasProfileEmail:
            typeof profile?.email === "string" &&
            profile.email.trim().length > 0,
          hasProfileSubject:
            typeof profile?.sub === "string" && profile.sub.length > 0,
          hasProviderAccountId:
            typeof account.providerAccountId === "string" &&
            account.providerAccountId.length > 0,
          profileSubjectMatchesProvider:
            typeof profile?.sub === "string" &&
            profile.sub === account.providerAccountId,
          hasAuthUserEmail: typeof user.email === "string",
          authUserEmailMatchesProfile:
            typeof user.email === "string" &&
            typeof profile?.email === "string" &&
            normalizeEmail(user.email) === normalizeEmail(profile.email),
        });
        return false;
      }

      try {
        const users = (await clientPromise)
          .db("VELMORI")
          .collection("users");

        const indexStatus = await hasRequiredGoogleIndexes(users);
        logGoogleSignIn("required_index_check", {
          allowed: indexStatus.allowed,
          emailIndexCount: indexStatus.emailIndexCount,
          hasUniqueEmailIndex: indexStatus.hasUniqueEmailIndex,
          googleSubIndexCount: indexStatus.googleSubIndexCount,
          hasUniqueGoogleSubIndex: indexStatus.hasUniqueGoogleSubIndex,
        });

        if (!indexStatus.allowed) {
          return false;
        }

        const allowed = await resolveGoogleUser(
          users,
          normalizeEmail(googleEmail),
          account.providerAccountId,
          user
        );
        logGoogleSignIn(allowed ? "sign_in_allowed" : "sign_in_rejected");
        return allowed;
      } catch (error) {
        console.error(
          "[auth][google-signin]",
          JSON.stringify({
            reason: "google_sign_in_exception",
            ...getSafeErrorDetails(error),
          })
        );
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      try {
        const users = (await clientPromise)
          .db("VELMORI")
          .collection("users");
        let dbUser: WithId<Document> | null = null;

        if (user && account?.provider === "credentials") {
          const userId = parseObjectId(user.id);
          if (!userId) return null;

          dbUser = await users.findOne({ _id: userId });
        } else if (user && account?.provider === "google") {
          const googleEmail = profile?.email;
          if (
            !isGoogleProfileVerified(
              user.email,
              account.providerAccountId,
              profile
            ) ||
            typeof googleEmail !== "string"
          ) {
            return null;
          }

          const subjectMatches = await users
            .find({ googleSub: account.providerAccountId })
            .limit(2)
            .toArray();

          if (subjectMatches.length !== 1) return null;
          const linkedUser = subjectMatches[0];
          if (!(linkedUser._id instanceof ObjectId)) return null;
          dbUser = linkedUser;

          const emailMatches = await users
            .find({ email: normalizeEmail(googleEmail) })
            .limit(2)
            .toArray();

          if (
            emailMatches.length > 1 ||
            (emailMatches.length === 1 &&
              !emailMatches[0]._id.equals(linkedUser._id))
          ) {
            return null;
          }
        } else if (!user && !account) {
          const userId = parseObjectId(token.id);
          if (!userId) return null;

          dbUser = await users.findOne({ _id: userId });
        } else {
          return null;
        }

        if (!dbUser || !(dbUser._id instanceof ObjectId)) return null;

        token.id = dbUser._id.toString();
        if (typeof dbUser.email !== "string") return null;
        token.email = dbUser.email;
        if (typeof dbUser.name === "string") token.name = dbUser.name;
        token.role =
          typeof dbUser.role === "string" && dbUser.role
            ? dbUser.role
            : "user";

        return token;
      } catch (error) {
        console.error("JWT user lookup error:", error);
        return null;
      }
    },
    async session({ session, token }) {
      const userId = parseObjectId(token.id);

      if (!session.user || !userId) {
        throw new Error("Unable to establish a MongoDB-backed session.");
      }

      session.user.id = userId.toString();
      session.user.role =
        typeof token.role === "string" && token.role
          ? token.role
          : "user";

      return session;
    },
  },
});
