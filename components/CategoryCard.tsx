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
      className="group relative block aspect-[4/5] overflow-hidden"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/35" />

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-6 sm:p-8">

        <h3 className="text-2xl font-bold uppercase tracking-[-0.04em] sm:text-3xl">
          {title}
        </h3>

        <span className="border border-white px-3 py-2 text-[9px] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explore
        </span>

      </div>
    </Link>
  );
}