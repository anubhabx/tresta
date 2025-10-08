import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  projectDisplayMode: "grid" | "list";
  setProjectDisplayMode: (mode: "grid" | "list") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => {
      return {
        sidebarOpen: false,
        toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

        projectDisplayMode: "grid",
        setProjectDisplayMode: (mode) => set({ projectDisplayMode: mode })
      };
    },
    {
      name: "ui-storage"
    }
  )
);
