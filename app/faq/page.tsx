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
    <main className="min-h-screen bg-[#fbf4f2] px-5 py-16 text-[#26231f] sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#755d59]">
          VELMORI
        </p>

        <h1 className="font-serif text-5xl font-normal tracking-[-0.055em] md:text-7xl">
          FAQ
        </h1>

        <div className="mt-10 divide-y divide-[#26231f]/15 border-y border-[#26231f]/15">
          {faqs.map((faq, index) => (
            <section key={index} className="py-7 sm:py-8">
              <h2 className="text-lg font-medium text-[#26231f] sm:text-xl">
                {faq.question}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-[#514b45] sm:text-base">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
