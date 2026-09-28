"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid admin credentials.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-12 text-center">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Administration Portal
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            ADMIN LOGIN
          </h1>

          <p className="mx-auto mt-5 max-w-[360px] text-sm leading-6 text-black/50">
            Sign in with your administrator credentials to access the store management dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Email Address
            </label>

            <input
              id="admin-email"
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
              htmlFor="admin-password"
              className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
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

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login as Admin"}
          </button>
        </form>

        <div className="mt-10 border-t border-black/10 pt-8 text-center space-y-4">
          <p className="text-sm text-black/50">
            Don&apos;t have an admin account?
          </p>

          <Link
            href="/admin/register"
            className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-50"
          >
            Register as Admin
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
      </div>
    </main>
  );
}