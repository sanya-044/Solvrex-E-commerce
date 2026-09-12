 import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
};

const syncCartToBackend = (items: CartItem[]) => {
  fetch("/api/user/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  }).catch(() => {});
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      setItems: (items) => set({ items }),

      addToCart: (product, size, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.size === size
          );

          let updatedItems;
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            updatedItems = [...state.items, { product, size, quantity }];
          }

          syncCartToBackend(updatedItems);
          return { items: updatedItems };
        });
      },

      removeFromCart: (productId, size) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          );
          syncCartToBackend(updatedItems);
          return { items: updatedItems };
        });
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity }
              : item
          );
          syncCartToBackend(updatedItems);
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        syncCartToBackend([]);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "fabrice-cart",
    }
  )
);