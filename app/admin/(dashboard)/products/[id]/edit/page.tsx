"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

type ProductForm = {
  name: string;
  category: string;
  gender: string;
  price: string;
  originalPrice: string;
  image: string;
  description: string;
  sizes: string;
  badge: string;
};

const initialForm: ProductForm = {
  name: "",
  category: "",
  gender: "",
  price: "",
  originalPrice: "",
  image: "",
  description: "",
  sizes: "",
  badge: "",
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [form, setForm] =
    useState<ProductForm>(initialForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products/${id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load product."
          );
        }

        setForm({
          name: data.name || "",
          category: data.category || "",
          gender: data.gender || "",
          price:
            data.price?.toString() || "",
          originalPrice:
            data.originalPrice?.toString() ||
            "",
          image: data.image || "",
          description:
            data.description || "",
          sizes: Array.isArray(data.sizes)
            ? data.sizes.join(", ")
            : "",
          badge: data.badge || "",
        });
      } catch (error) {
        console.error(
          "Load product error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const updateField = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const sizes = form.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean);

      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            gender: form.gender,
            price: Number(form.price),
            originalPrice: Number(
              form.originalPrice
            ),
            image: form.image,
            description:
              form.description,
            sizes,
            badge: form.badge || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update product."
        );
      }

      setSuccess(
        "Product updated successfully."
      );

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 700);
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
          Loading Product...
        </p>
      </div>
    );
  }

  if (error && !form.name) {
    return (
      <div className="p-8">
        <Link
          href="/admin/products"
          className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 hover:text-black"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <p className="text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-12">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/admin/products"
          className="mb-10 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 transition-opacity hover:text-black"
        >
          <ArrowLeft size={14} />
          Back to Products
        </Link>

        <div className="mb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-black/40">
            Admin / Products / Edit
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em]">
            Edit Product
          </h1>
        </div>

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          <div className="grid gap-6 md:grid-cols-2">

            <Field
              label="Product Name"
              value={form.name}
              onChange={(value) =>
                updateField("name", value)
              }
              required
            />

            <Field
              label="Category"
              value={form.category}
              onChange={(value) =>
                updateField(
                  "category",
                  value
                )
              }
              required
            />

            <Field
              label="Gender"
              value={form.gender}
              onChange={(value) =>
                updateField(
                  "gender",
                  value
                )
              }
              required
            />

            <Field
              label="Price"
              type="number"
              value={form.price}
              onChange={(value) =>
                updateField(
                  "price",
                  value
                )
              }
              required
            />

            <Field
              label="Original Price"
              type="number"
              value={form.originalPrice}
              onChange={(value) =>
                updateField(
                  "originalPrice",
                  value
                )
              }
              required
            />

            <Field
              label="Badge"
              value={form.badge}
              onChange={(value) =>
                updateField(
                  "badge",
                  value
                )
              }
              placeholder="Bestseller / New / Limited"
            />

          </div>

          <Field
            label="Image URL"
            value={form.image}
            onChange={(value) =>
              updateField("image", value)
            }
            required
          />

          <div>
            <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              required
              rows={5}
              className="w-full resize-none border border-black/15 bg-transparent px-4 py-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          <Field
            label="Sizes"
            value={form.sizes}
            onChange={(value) =>
              updateField(
                "sizes",
                value
              )
            }
            placeholder="S, M, L, XL"
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-14 items-center gap-3 bg-black px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={15} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="h-12 w-full border border-black/15 bg-transparent px-4 text-sm outline-none transition-colors focus:border-black"
      />
    </div>
  );
}