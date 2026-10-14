"use client";

import { useState } from "react";

type Props = {
  name: string;
  email: string;
  phone: string;
};

export default function EditProfile({
  name,
  email,
  phone,
}: Props) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name,
    email,
    phone,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to update profile."
        );
        return;
      }

      setMessage(
        data.message || "Profile updated successfully."
      );

      setEditing(false);

      // Refresh the account page so the updated
      // profile data is loaded from the database.
      window.location.reload();
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name,
      email,
      phone,
    });

    setMessage("");
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setMessage("");
          setEditing(true);
        }}
        className="border border-black bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
      >
        Edit Profile
      </button>
    );
  }

  return (
    <div className="space-y-5 border border-black/10 p-6">

      {/* NAME */}
      <div>
        <label
          htmlFor="profile-name"
          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/40"
        >
          Name
        </label>

        <input
          id="profile-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          className="w-full border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
        />
      </div>

      {/* EMAIL */}
      <div>
        <label
          htmlFor="profile-email"
          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/40"
        >
          Email
        </label>

        <input
          id="profile-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
        />
      </div>

      {/* PHONE */}
      <div>
        <label
          htmlFor="profile-phone"
          className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/40"
        >
          Phone
        </label>

        <input
          id="profile-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={form.phone}
          onChange={handleChange}
          disabled={loading}
          className="w-full border border-black/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
        />
      </div>

      {/* MESSAGE */}
      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}

      {/* BUTTONS */}
      <div className="flex gap-3">

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="border border-black bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="border border-black/20 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}