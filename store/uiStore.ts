import { create } from "zustand";

interface UIState {
  navTheme: "dark" | "light";
  setNavTheme: (theme: "dark" | "light") => void;
}

export const useUIStore = create<UIState>((set) => ({
  navTheme: "dark",
  setNavTheme: (theme) => set({ navTheme: theme }),
}));
