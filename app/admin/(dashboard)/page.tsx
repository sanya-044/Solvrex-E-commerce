import clientPromise from "@/lib/mongodb";

export default async function AdminDashboard() {
  const client = await clientPromise;
  const db = client.db("VELMORI");

  const [productsCount, ordersCount, customersCount, revenueResult] =
    await Promise.all([
      db.collection("products").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("orders").aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $convert: {
                  input: "$total",
                  to: "double",
                  onError: 0,
                  onNull: 0,
                },
              },
            },
          },
        },
      ]).toArray(),
    ]);

  const revenue = revenueResult[0]?.totalRevenue ?? 0;

  return (
    <div className="p-5 sm:p-8 lg:p-12">
      <div className="border-b border-black/10 pb-10">
        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
          Overview
        </p>

        <h1 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl lg:text-6xl">
          DASHBOARD
        </h1>

        <p className="mt-4 text-sm text-black/45">
          Manage your VELMORI store.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="border border-black/10 p-4 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Products
          </p>

          <p className="mt-3 truncate text-2xl font-black sm:mt-5 sm:text-4xl">
            {productsCount}
          </p>
        </div>

        <div className="border border-black/10 p-4 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Orders
          </p>

          <p className="mt-3 truncate text-2xl font-black sm:mt-5 sm:text-4xl">
            {ordersCount}
          </p>
        </div>

        <div className="border border-black/10 p-4 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Customers
          </p>

          <p className="mt-3 truncate text-2xl font-black sm:mt-5 sm:text-4xl">
            {customersCount}
          </p>
        </div>

        <div className="border border-black/10 p-4 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Revenue
          </p>

          <p className="mt-3 truncate text-2xl font-black sm:mt-5 sm:text-4xl">
            ₹{revenue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <section className="mt-10 border border-black/10 p-5 sm:p-8">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
          Store Management
        </p>

        <h2 className="mt-4 text-2xl font-black tracking-[-0.03em]">
          Welcome to VELMORI Administration
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
          Products, orders, customers and inventory management
          are available from the navigation.
        </p>
      </section>
    </div>
  );
}