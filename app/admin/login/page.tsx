"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Invalid admin credentials."
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6">
      <div className="w-full max-w-[460px]">
        <div className="mb-12 text-center">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
            FABRICE
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em]">
            ADMIN
          </h1>

          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
            Administration Portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-black/10 bg-[#f5f3ee] p-8"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="h-12 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="h-12 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors focus:border-black"
              />
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.12em] text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-between bg-black px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {loading
                  ? "Authenticating..."
                  : "Admin Login"}
              </span>

              <span>→</span>
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-[8px] uppercase tracking-[0.2em] text-black/30">
          Authorized personnel only
        </p>
      </div>
    </main>
  );
}