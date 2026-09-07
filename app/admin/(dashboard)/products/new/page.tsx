"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const categories = [
  "T-Shirts",
  "Hoodies",
  "Shirts",
  "Bottomwear",
  "Outerwear",
  "Tops",
  "Dresses",
];

const genders = [
  "Men",
  "Women",
  "Unisex",
];

const availableSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "28",
  "30",
  "32",
  "34",
  "36",
];

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("T-Shirts");
  const [gender, setGender] = useState("Unisex");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] =
    useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] =
    useState("");
  const [badge, setBadge] = useState("");

  const [sizes, setSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSize = (size: string) => {
    setSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size]
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            category,
            gender,
            price,
            originalPrice,
            image,
            description,
            sizes,
            badge,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create product."
        );
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="border-b border-black/10 pb-10">
        <Link
          href="/admin/products"
          className="mb-6 inline-block text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black"
        >
          ← Back to Products
        </Link>

        <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
          Store Management
        </p>

        <h1 className="text-5xl font-black tracking-[-0.06em]">
          ADD PRODUCT
        </h1>

        <p className="mt-4 text-sm text-black/45">
          Add a new product to the FABRICE catalog.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 max-w-[1000px]"
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Product name */}
          <div className="col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Product Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              placeholder="e.g. Essential Heavy Tee"
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Gender
            </label>

            <select
              id="gender"
              value={gender}
              onChange={(event) =>
                setGender(event.target.value)
              }
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            >
              {genders.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Selling Price (₹)
            </label>

            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              required
              placeholder="1299"
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Original price */}
          <div>
            <label
              htmlFor="originalPrice"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Original Price (₹)
            </label>

            <input
              id="originalPrice"
              type="number"
              min="1"
              value={originalPrice}
              onChange={(event) =>
                setOriginalPrice(
                  event.target.value
                )
              }
              required
              placeholder="1799"
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Image */}
          <div className="col-span-2">
            <label
              htmlFor="image"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Image URL
            </label>

            <input
              id="image"
              type="url"
              value={image}
              onChange={(event) =>
                setImage(event.target.value)
              }
              required
              placeholder="https://..."
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              required
              rows={5}
              placeholder="Describe the product..."
              className="w-full resize-none border border-black/15 bg-transparent p-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Badge */}
          <div>
            <label
              htmlFor="badge"
              className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]"
            >
              Badge
            </label>

            <input
              id="badge"
              type="text"
              value={badge}
              onChange={(event) =>
                setBadge(event.target.value)
              }
              placeholder="New / Bestseller / Trending"
              className="h-14 w-full border border-black/15 bg-transparent px-4 text-sm outline-none focus:border-black"
            />
          </div>

          {/* Sizes */}
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em]">
              Available Sizes
            </p>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const selected =
                  sizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      toggleSize(size)
                    }
                    className={`h-10 min-w-10 border px-3 text-[9px] font-bold uppercase tracking-[0.1em] transition-colors ${
                      selected
                        ? "border-black bg-black text-white"
                        : "border-black/15 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 border border-red-200 bg-red-50 p-5 text-[9px] font-bold uppercase tracking-[0.15em] text-red-600">
            {error}
          </div>
        )}

        <div className="mt-10 flex gap-4 border-t border-black/10 pt-8">
          <Link
            href="/admin/products"
            className="flex h-14 items-center border border-black/15 px-7 text-[9px] font-bold uppercase tracking-[0.2em] hover:border-black"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="h-14 bg-black px-8 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Product..."
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}