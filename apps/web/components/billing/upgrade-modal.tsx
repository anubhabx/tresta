"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer";
import { PricingTableView } from "./pricing-table";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

// Global state for Upgrade Modal using Zustand (simple store)
interface UpgradeModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useUpgradeModal = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function UpgradeModal() {
  const { isOpen, close, open } = useUpgradeModal();
  const pathname = usePathname();

  // Close modal on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          open();
          return;
        }
        close();
      }}
    >
      <DrawerContent className="h-[92vh] max-h-[92vh] overflow-hidden">
        <DrawerHeader className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <DrawerTitle className="text-2xl font-bold text-center md:text-left">
            Upgrade Your Plan
          </DrawerTitle>
          <DrawerDescription className="text-center md:text-left">
            Choose a plan that fits your needs to unlock more features.
          </DrawerDescription>
          <div className="mt-2 flex justify-center md:justify-start">
            <Button variant="link" className="h-auto p-0" asChild>
              <Link href="/pricing" onClick={close}>
                See all benefits
              </Link>
            </Button>
          </div>
        </DrawerHeader>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-6 px-4 sm:px-6">
          <div className="mx-auto mt-2 w-full max-w-7xl">
            <PricingTableView compact keyFeatureCount={3} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
