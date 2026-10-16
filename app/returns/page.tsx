export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-[#fbf4f2] px-5 py-16 text-[#26231f] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#755d59]">
          VELMORI
        </p>

        <h1 className="font-serif text-5xl font-normal tracking-[-0.055em] md:text-7xl">
          Returns
        </h1>

        <div className="mt-10 divide-y divide-[#26231f]/15 border-y border-[#26231f]/15 text-[#514b45]">
          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Return Eligibility
            </h2>

            <p>
              Items may be eligible for return if they are unused, unworn,
              and returned in their original condition with all applicable
              tags and packaging intact.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Return Request
            </h2>

            <p>
              If you need to return an item, please contact our support team
              with your order details and the reason for your return.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Condition of Items
            </h2>

            <p>
              Returned products should be in the same condition in which they
              were received. Items showing signs of use, damage, washing, or
              alteration may not qualify for a return.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Refunds
            </h2>

            <p>
              Once a returned item has been received and inspected, the
              applicable refund process will be initiated. Processing times
              may vary depending on the payment method.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
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
