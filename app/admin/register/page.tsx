"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          adminKey: adminKey.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Admin account created successfully! Redirecting to login...");
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-10 text-center">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
          Administration Portal
        </p>

        <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
          ADMIN REGISTER
        </h1>

        <p className="mx-auto mt-5 max-w-[360px] text-sm leading-6 text-black/50">
          Create an administrator account with your organization authorization key.
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 border border-green-500/20 bg-green-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-green-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label
            htmlFor="admin-fullname"
            className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            Full Name
          </label>

          <input
            id="admin-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            autoComplete="name"
            disabled={loading}
            className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="admin-reg-email"
            className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            Email Address
          </label>

          <input
            id="admin-reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@velmori.com"
            required
            autoComplete="email"
            disabled={loading}
            className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="admin-reg-password"
            className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="admin-reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 8 characters)"
              required
              autoComplete="new-password"
              minLength={8}
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 pr-12 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-reg-confirm-password"
            className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            Confirm Password
          </label>

          <div className="relative">
            <input
              id="admin-reg-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              minLength={8}
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 pr-12 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 transition-colors hover:text-black"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-key"
            className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
          >
            Admin Authorization Key
          </label>

          <input
            id="admin-key"
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Enter the secret admin key"
            required
            disabled={loading}
            className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
          />
        </div>

        <button
          id="admin-register-btn"
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating Admin Account..." : "Register as Admin"}
        </button>
      </form>

      <div className="mt-10 border-t border-black/10 pt-8 text-center space-y-4">
        <p className="text-sm text-black/50">
          Already have an admin account?
        </p>

        <Link
          href="/admin/login"
          className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-50"
        >
          Login here
        </Link>

        <div>
          <Link
            href="/"
            className="inline-block text-xs text-black/40 hover:text-black transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
