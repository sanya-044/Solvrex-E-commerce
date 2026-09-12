 import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

type WishlistStore = {
  items: Product[];
  setItems: (items: Product[]) => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
};

const syncWishlistToBackend = (items: Product[]) => {
  fetch("/api/user/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch(() => {});
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      toggleWishlist: (product) => {
        set((state) => {
          const exists = state.items.some((item) => item.id === product.id);
          let updatedItems;

          if (exists) {
            updatedItems = state.items.filter((item) => item.id !== product.id);
          } else {
            updatedItems = [...state.items, product];
          }

          syncWishlistToBackend(updatedItems);
          return { items: updatedItems };
        });
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      removeFromWishlist: (productId) => {
        set((state) => {
          const updatedItems = state.items.filter((item) => item.id !== productId);
          syncWishlistToBackend(updatedItems);
          return { items: updatedItems };
        });
      },

      clearWishlist: () => {
        set({ items: [] });
        syncWishlistToBackend([]);
      },
    }),
    {
      name: "fabrice-wishlist",
    }
  )
);