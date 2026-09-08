 import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AccountActions from "@/components/AccountActions";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-144px)] bg-[#f5f3ee] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1000px]">

        {/* HEADER */}
        <div className="border-b border-black/10 pb-10">
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Your FABRICE Account
          </p>
          <h1 className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
            ACCOUNT
          </h1>
        </div>

        {/* PROFILE */}
        <section className="grid gap-12 py-12 md:grid-cols-2">
          <div>
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
              Profile
            </p>

            <div className="space-y-6">
              <div className="border-b border-black/10 pb-5">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Name
                </p>
                <p className="text-lg">
                  {session.user.name || "FABRICE Customer"}
                </p>
              </div>

              <div className="border-b border-black/10 pb-5">
                <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Email
                </p>
                <p className="text-lg">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
              Quick Access
            </p>

            <div className="space-y-3">
              <Link
                href="/wishlist"
                className="flex h-14 items-center justify-between border border-black/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:border-black hover:bg-black hover:text-white"
              >
                <span>Wishlist</span>
                <span>→</span>
              </Link>

              {/* Added Orders Button */}
              <Link
  href="/orders"
  className="flex h-14 items-center justify-between border border-black/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:border-black hover:bg-black hover:text-white"
>
  <span>Orders</span>
  <span>→</span>
</Link>
              

              <Link
                href="/cart"
                className="flex h-14 items-center justify-between border border-black/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:border-black hover:bg-black hover:text-white"
              >
                <span>Shopping Bag</span>
                <span>→</span>
              </Link>

              <Link
                href="/shop"
                className="flex h-14 items-center justify-between border border-black/15 px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-all hover:border-black hover:bg-black hover:text-white"
              >
                <span>Continue Shopping</span>
                <span>→</span>
              </Link>

              <AccountActions />
            </div>
          </div>
        </section>

        {/* ACCOUNT STATUS */}
        <div className="border-t border-black/10 py-8">
          <p className="text-[9px] uppercase tracking-[0.2em] text-black/40">
            Signed in as
          </p>
          <p className="mt-2 text-sm">
            {session.user.email}
          </p>
        </div>

      </div>
    </main>
  );
}