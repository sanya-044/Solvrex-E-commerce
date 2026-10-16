const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse the products available on Velmori, select your preferred product and size, add it to your cart, and proceed to checkout.",
  },
  {
    question: "Can I change my order after placing it?",
    answer:
      "Order changes may depend on whether the order has already been processed. Contact our support team as soon as possible if you need assistance.",
  },
  {
    question: "How do I choose the correct size?",
    answer:
      "Use the size guide available on the product page to compare the available sizes before adding an item to your cart.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order has been dispatched, tracking information will be provided when available.",
  },
  {
    question: "Can I return an item?",
    answer:
      "Eligible items may be returned according to Velmori's return requirements. Please visit the Returns page for more information.",
  },
  {
    question: "How can I contact Velmori?",
    answer:
      "Visit the Contact page to find the available ways to reach the Velmori support team.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm tracking-[0.3em] text-gray-400">
          VELMORI
        </p>

        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
          FAQ
        </h1>

        <div className="mt-12 divide-y divide-white/10">
          {faqs.map((faq, index) => (
            <section key={index} className="py-7">
              <h2 className="text-lg font-medium text-white">
                {faq.question}
              </h2>

              <p className="mt-3 max-w-3xl text-gray-400 leading-7">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}