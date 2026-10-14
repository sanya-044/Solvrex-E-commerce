"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function AccountActions() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex h-14 w-full items-center justify-between border border-black/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span>
        {loading ? "Logging Out..." : "Logout"}
      </span>

      <span>→</span>
    </button>
  );
}