 "use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // Added phone state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone, // Included phone in the payload sent to backend
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      alert("Account created successfully!");
      window.location.href = "/login";
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[520px]">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Join FABRICE
          </p>
          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            CREATE ACCOUNT
          </h1>
          <p className="mx-auto mt-5 max-w-[380px] text-sm leading-6 text-black/50">
            Create your FABRICE account and make every shopping experience yours.
          </p>
        </div>

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
              placeholder="Your name"
              required
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
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
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
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
              placeholder="Your phone number"
              required
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
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
              placeholder="Create a password"
              required
              minLength={8}
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
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
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-black/25 focus:border-black"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
          >
            Create Account
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