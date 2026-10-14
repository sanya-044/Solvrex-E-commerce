export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm tracking-[0.3em] text-gray-400">
          VELMORI
        </p>

        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          Returns
        </h1>

        <div className="mt-12 space-y-10 text-gray-300 leading-7">
          <section>
            <h2 className="mb-3 text-xl text-white">
              Return Eligibility
            </h2>

            <p>
              Items may be eligible for return if they are unused, unworn,
              and returned in their original condition with all applicable
              tags and packaging intact.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Return Request
            </h2>

            <p>
              If you need to return an item, please contact our support team
              with your order details and the reason for your return.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Condition of Items
            </h2>

            <p>
              Returned products should be in the same condition in which they
              were received. Items showing signs of use, damage, washing, or
              alteration may not qualify for a return.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Refunds
            </h2>

            <p>
              Once a returned item has been received and inspected, the
              applicable refund process will be initiated. Processing times
              may vary depending on the payment method.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Need Help?
            </h2>

            <p>
              If you have questions about a return or refund, please contact
              the Velmori support team before sending your item back.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}