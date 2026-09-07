 "use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 1000);
  };

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[520px]">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Welcome Back
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            LOGIN
          </h1>

          <p className="mx-auto mt-5 max-w-[360px] text-sm leading-6 text-black/50">
            Sign in to your FABRICE account to continue shopping.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 border border-red-500/20 bg-red-50 px-4 py-3 text-center text-[10px] uppercase tracking-[0.12em] text-red-600">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-7">

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

          {/* PASSWORD */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[9px] font-bold uppercase tracking-[0.2em]"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotSubmitted(false);
                  setForgotEmail("");
                  setIsForgotOpen(true);
                }}
                className="text-[9px] uppercase tracking-[0.15em] text-black/40 transition-opacity hover:opacity-100"
              >
                Forgot Password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
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
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10" />
          </div>
          <span className="relative bg-[#f5f3ee] px-4 text-[9px] uppercase tracking-[0.2em] text-black/40">
            Or
          </span>
        </div>

        {/* GOOGLE SIGN IN */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 border border-black/15 bg-white text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-all hover:border-black disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.21 21.34 7.27 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.24c-.25-.72-.39-1.5-.39-2.24s.14-1.52.39-2.24V6.6H1.19C.43 8.13 0 9.87 0 12s.43 3.87 1.19 5.4l4.08-3.16z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.27 0 3.21 2.66 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          Continue with Google
        </button>

        {/* DEMO ACCOUNT */}
        <div className="mt-8 border border-black/10 px-5 py-4">
          <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
            Test Account
          </p>

          <p className="text-xs text-black/60">
            demo@fabrice.com
          </p>

          <p className="mt-1 text-xs text-black/60">
            password123
          </p>
        </div>

        {/* SIGNUP */}
        <div className="mt-10 border-t border-black/10 pt-8 text-center">
          <p className="text-sm text-black/50">
            Don&apos;t have an account?
          </p>

          <Link
            href="/signup"
            className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em] underline underline-offset-4 transition-opacity hover:opacity-50"
          >
            Create Account
          </Link>
        </div>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#f5f3ee] p-8 shadow-2xl border border-black/10">
            
            <button
              type="button"
              onClick={() => setIsForgotOpen(false)}
              className="absolute right-5 top-5 text-black/60 hover:text-black"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <h3 className="text-xl font-black uppercase tracking-[-0.04em] mb-2">
              Reset Password
            </h3>
            
            <p className="text-xs text-black/50 mb-6">
              Enter your email address and we will send you a link to reset your password.
            </p>

            {forgotSubmitted ? (
              <div className="border border-green-500/20 bg-green-50 px-4 py-4 text-center text-[10px] uppercase tracking-[0.12em] text-green-700">
                Recovery instructions have been sent to your email.
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-12 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex h-12 w-full items-center justify-center bg-black text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </main>
  );
}