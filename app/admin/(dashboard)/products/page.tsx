"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type AdminProduct = {
  _id: string;
  id: number;
  name: string;
  category: string;
  gender: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  sizes: string[];
  badge?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<
    AdminProduct[]
  >([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(
          "/api/admin/products"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        setProducts(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
const handleDelete = async (
  productId: number
) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `/api/admin/products/${productId}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to delete product."
      );
    }

    alert("Product deleted successfully.");

    router.refresh();
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete product."
    );
  }
};
  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-end justify-between border-b border-black/10 pb-10">
        <div>
          <p className="mb-4 text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Store Management
          </p>

          <h1 className="text-5xl font-black tracking-[-0.06em]">
            PRODUCTS
          </h1>

          <p className="mt-4 text-sm text-black/45">
            Manage the FABRICE product catalog.
          </p>
        </div>

        <button
  type="button"
  onClick={() =>
    window.location.href =
      "/admin/products/new"
  }
  className="bg-black px-6 py-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
>
  + Add Product
</button>
      </div>

      <div className="mt-10">
        {loading ? (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Loading Products...
          </p>
        ) : error ? (
          <p className="border border-red-200 bg-red-50 p-5 text-[9px] font-bold uppercase tracking-[0.15em] text-red-600">
            {error}
          </p>
        ) : products.length === 0 ? (
          <div className="border border-black/10 p-12 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
              No Products
            </p>

            <h2 className="mt-4 text-2xl font-black">
              Your catalog is empty.
            </h2>
          </div>
        ) : (
          <div className="overflow-hidden border border-black/10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.18em]">
                    Product
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.18em]">
                    Category
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.18em]">
                    Price
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.18em]">
                    Sizes
                  </th>

                  <th className="px-5 py-4 text-[8px] font-bold uppercase tracking-[0.18em]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-12 object-cover"
                        />

                        <div>
                          <p className="text-sm font-medium">
                            {product.name}
                          </p>

                          <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-black/40">
                            #{product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-[9px] uppercase tracking-[0.15em] text-black/50">
                      {product.category}
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-semibold">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="text-xs text-black/35 line-through">
                        ₹
                        {product.originalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-[9px] uppercase tracking-[0.12em] text-black/50">
                      {product.sizes.join(", ")}
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex gap-4">
                        <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/products/${product.id}/edit`
                          )
                        }
                        className="text-[8px] font-bold uppercase tracking-[0.15em] hover:opacity-50"
                      >
                        Edit
                      </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(product.id)
                          }
                          className="text-[8px] font-bold uppercase tracking-[0.15em] text-red-500 hover:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}