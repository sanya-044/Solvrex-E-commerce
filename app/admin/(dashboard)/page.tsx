export default function AdminDashboard() {
  return (
    <div className="p-8 lg:p-12">
      <div className="border-b border-black/10 pb-10">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
          Overview
        </p>

        <h1 className="text-5xl font-black tracking-[-0.06em] lg:text-6xl">
          DASHBOARD
        </h1>

        <p className="mt-4 text-sm text-black/45">
          Manage your FABRICE store.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-4 gap-4">
        <div className="border border-black/10 p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Products
          </p>

          <p className="mt-5 text-4xl font-black">
            0
          </p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Orders
          </p>

          <p className="mt-5 text-4xl font-black">
            0
          </p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Customers
          </p>

          <p className="mt-5 text-4xl font-black">
            0
          </p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Revenue
          </p>

          <p className="mt-5 text-4xl font-black">
            ₹0
          </p>
        </div>
      </div>

      <section className="mt-10 border border-black/10 p-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
          Store Management
        </p>

        <h2 className="mt-4 text-2xl font-black tracking-[-0.03em]">
          Welcome to FABRICE Administration
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
          Products, orders, customers and inventory
          management will be available from the navigation.
        </p>
      </section>
    </div>
  );
}