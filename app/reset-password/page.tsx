"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to reset password."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[520px]">

        <div className="mb-12 text-center">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            FABRICE / ACCOUNT
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            NEW PASSWORD
          </h1>

          <p className="mx-auto mt-5 max-w-[360px] text-sm leading-6 text-black/50">
            Create a new password for your FABRICE account.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-red-600">
            {error}
          </div>
        )}

        {success ? (
          <div className="border border-green-500/20 bg-green-50 px-5 py-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-700">
              Password successfully changed.
            </p>

            <p className="mt-2 text-xs text-green-700/70">
              Redirecting you to login...
            </p>
          </div>
        ) : !token ? (
          <div className="border border-red-500/20 bg-red-50 px-5 py-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-red-600">
              Invalid reset link.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-block text-[10px] font-bold uppercase tracking-[0.15em] underline"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
                required
                disabled={loading}
                className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Enter password again"
                required
                disabled={loading}
                className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}