"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const cleanPhone = phone.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[520px]">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Join VELMORI
          </p>
          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            CREATE ACCOUNT
          </h1>
          <p className="mx-auto mt-5 max-w-[380px] text-sm leading-6 text-black/50">
            Create your VELMORI account and make every shopping experience yours.
          </p>
        </div>

        {/* ERROR NOTIFICATION */}
        {error && (
          <div className="mb-6 border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-red-600">
            {error}
          </div>
        )}

        {/* SUCCESS NOTIFICATION */}
        {success && (
          <div className="mb-6 border border-green-500/20 bg-green-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-green-700">
            {success}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* NAME */}
          <div>
            <label
              htmlFor="name"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label
              htmlFor="phone"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              required
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 8 characters)"
              required
              minLength={8}
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />
          </div>

          {/* CONFIRM PASSWORD */}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength={8}
              disabled={loading}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black disabled:opacity-50"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* LOGIN */}
        <div className="mt-10 border-t border-black/10 pt-8 text-center">
          <p className="text-sm text-black/50">Already have an account?</p>
          <Link
            href="/login"
            className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-50"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}