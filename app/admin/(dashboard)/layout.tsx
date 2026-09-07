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
      <header className="flex h-20 items-center justify-between border-b border-black/10 px-8">
        <Link
          href="/admin"
          className="text-2xl font-black tracking-[-0.05em]"
        >
          FABRICE
        </Link>

        <div className="flex items-center gap-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/50">
            {admin.email}
          </p>

          <AdminLogout />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        <aside className="w-60 shrink-0 border-r border-black/10 p-6">
          <p className="mb-6 text-[9px] font-bold uppercase tracking-[0.25em] text-black/30">
            Administration
          </p>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="block px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="block px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className="block px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
            >
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className="block px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-black hover:text-white"
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