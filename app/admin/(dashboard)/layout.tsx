import Link from "next/link";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import AdminLogout from "@/components/AdminLogout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-black">
      <header className="flex h-20 items-center justify-between gap-3 border-b border-black/10 px-4 sm:px-8">
        <Link
          href="/admin"
          className="shrink-0 text-xl font-black tracking-[-0.05em] sm:text-2xl"
        >
          VELMORI
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <p className="hidden truncate text-[9px] font-bold uppercase tracking-[0.18em] text-black/50 sm:block">
            {admin.email}
          </p>

          <AdminLogout />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-black/10 p-4 md:w-60 md:border-b-0 md:border-r md:p-6">
          <p className="mb-3 hidden text-[9px] font-bold uppercase tracking-[0.25em] text-black/30 md:mb-6 md:block">
            Administration
          </p>

          <nav className="flex gap-2 overflow-x-auto scrollbar-hide md:block md:space-y-1 md:overflow-visible">
            <Link
              href="/admin"
              className="block shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="block shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className="block shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className="block shrink-0 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Customers
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}