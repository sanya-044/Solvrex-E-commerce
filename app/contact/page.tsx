export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#fbf4f2] px-5 py-16 text-[#26231f] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#755d59]">
          VELMORI
        </p>

        <h1 className="font-serif text-5xl font-normal tracking-[-0.055em] md:text-7xl">
          Contact
        </h1>

        <div className="mt-10 divide-y divide-[#26231f]/15 border-y border-[#26231f]/15 text-[#514b45]">
          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              We&apos;re Here to Help
            </h2>

            <p>
              Have a question about an order, product, size, shipping, or
              returns? Reach out to the Velmori support team and we&apos;ll help
              you with your request.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Customer Support
            </h2>

            <p>
              For order-related questions, please include your order number
              so that we can assist you more efficiently.
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Email
            </h2>

            <a
              href="mailto:support@VELMORI.com"
              className="text-[#755d59] underline decoration-[#755d59]/50 underline-offset-4 transition hover:text-[#26231f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              support@VELMORI.com
            </a>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="mb-3 text-xl font-medium text-[#26231f]">
              Before Contacting Us
            </h2>

            <p>
              You can also visit our FAQ, Shipping, and Returns pages for
              answers to common questions.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
