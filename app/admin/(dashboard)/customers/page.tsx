import clientPromise from "@/lib/mongodb";

type Customer = {
  _id: unknown;
  name: string;
  email: string;
  createdAt?: Date;
};

export default async function CustomersPage() {
  const client = await clientPromise;
  const db = client.db("VELMORI");

  const customers =
    (await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            password: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray()) as Customer[];

  return (
    <div className="p-6 sm:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
              Admin / Customers
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-[-0.06em] sm:text-5xl">
              Customers
            </h1>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
            {customers.length} Customers
          </p>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto border border-black/10">

          <table className="w-full min-w-[700px]">

            <thead className="border-b border-black/10 bg-black/[0.02]">

              <tr>
                <th className="px-5 py-4 text-left text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Customer
                </th>

                <th className="px-5 py-4 text-left text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Email
                </th>

                <th className="px-5 py-4 text-left text-[8px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Joined
                </th>
              </tr>

            </thead>

            <tbody>

              {customers.map((customer) => (

                <tr
                  key={String(customer._id)}
                  className="border-b border-black/10 last:border-0"
                >

                  <td className="px-5 py-5">
                    <p className="text-sm font-semibold">
                      {customer.name}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <p className="text-sm text-black/60">
                      {customer.email}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-black/50">
                      {customer.createdAt
                        ? new Date(
                            customer.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </p>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {customers.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                No customers yet
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}