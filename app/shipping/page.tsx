export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-[#fbf4f2] px-5 py-16 text-[#26231f] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#755d59]">
          VELMORI
        </p>

        <h1 className="font-serif text-5xl font-normal tracking-[-0.055em] md:text-7xl">
          Shipping
        </h1>

        <div className="mt-10 divide-y divide-[#26231f]/15 border-y border-[#26231f]/15 text-[#514b45]">
          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">Delivery</h2>
            <p>
              Orders are carefully prepared and shipped to the address
              provided during checkout. Delivery availability may vary
              depending on your location.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">Processing Time</h2>
            <p>
              Orders are processed after successful payment confirmation.
              Processing and delivery times may vary depending on your
              location and order volume.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">Order Tracking</h2>
            <p>
              Once your order has been dispatched, tracking information will
              be provided when available.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">Delivery Address</h2>
            <p>
              Please make sure your shipping address is accurate before
              completing your order. Velmori cannot guarantee delivery to an
              incorrect or incomplete address.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
