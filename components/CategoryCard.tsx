import Link from "next/link";

type CategoryCardProps = {
  title: string;
  image: string;
};

export default function CategoryCard({
  title,
  image,
}: CategoryCardProps) {
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(title)}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-[#f0dcdd] text-[#292421]"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-[#fbf4f2]/95 p-4 sm:p-5">

        <h3 className="font-serif text-2xl font-normal tracking-[-0.04em] sm:text-3xl">
          {title}
        </h3>

        <span className="border border-[#292421]/40 px-3 py-2 text-[9px] uppercase tracking-[0.14em] transition-colors duration-300 group-hover:bg-[#292421] group-hover:text-[#fbf4f2]">
          Explore
        </span>

      </div>
    </Link>
  );
}
