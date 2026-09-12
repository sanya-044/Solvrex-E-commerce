 "use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function SyncUserStores() {
  const { status } = useSession();
  const setCartItems = useCartStore((state) => state.setItems);
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch Cart - Always update state, even if empty ([])
      fetch("/api/user/cart")
        .then((res) => res.json())
        .then((data) => {
          setCartItems(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to sync cart:", err));

      // Fetch Wishlist - Always update state, even if empty ([])
      fetch("/api/user/wishlist")
        .then((res) => res.json())
        .then((data) => {
          setWishlistItems(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to sync wishlist:", err));
    } else if (status === "unauthenticated") {
      // Clear local stores when user logs out so data doesn't leak
      clearCart();
      clearWishlist();
    }
  }, [status, setCartItems, setWishlistItems, clearCart, clearWishlist]);

  return null;
}