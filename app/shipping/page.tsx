export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm tracking-[0.3em] text-gray-400">
          VELMORI
        </p>

        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          Shipping
        </h1>

        <div className="mt-12 space-y-10 text-gray-300 leading-7">
          <section>
            <h2 className="mb-3 text-xl text-white">Delivery</h2>
            <p>
              Orders are carefully prepared and shipped to the address
              provided during checkout. Delivery availability may vary
              depending on your location.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">Processing Time</h2>
            <p>
              Orders are processed after successful payment confirmation.
              Processing and delivery times may vary depending on your
              location and order volume.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">Order Tracking</h2>
            <p>
              Once your order has been dispatched, tracking information will
              be provided when available.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">Delivery Address</h2>
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