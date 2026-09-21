export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm tracking-[0.3em] text-gray-400">
          VELMORI
        </p>

        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          Contact
        </h1>

        <div className="mt-12 space-y-10 text-gray-300 leading-7">
          <section>
            <h2 className="mb-3 text-xl text-white">
              We&apos;re Here to Help
            </h2>

            <p>
              Have a question about an order, product, size, shipping, or
              returns? Reach out to the Velmori support team and we&apos;ll help
              you with your request.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Customer Support
            </h2>

            <p>
              For order-related questions, please include your order number
              so that we can assist you more efficiently.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
              Email
            </h2>

            <a
              href="mailto:support@VELMORI.com"
              className="text-gray-300 underline underline-offset-4 transition hover:text-white"
            >
              support@VELMORI.com
            </a>
          </section>

          <section>
            <h2 className="mb-3 text-xl text-white">
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