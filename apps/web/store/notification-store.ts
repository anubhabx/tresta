import { create } from "zustand";

interface NotificationStore {
  isOpen: boolean;
  openCenter: () => void;
  closeCenter: () => void;
  toggleCenter: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  isOpen: false,
  openCenter: () => set({ isOpen: true }),
  closeCenter: () => set({ isOpen: false }),
  toggleCenter: () => set((state) => ({ isOpen: !state.isOpen })),
}));
