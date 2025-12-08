
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { PricingTable } from "./pricing-table";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { create } from "zustand";

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
    const { isOpen, close } = useUpgradeModal();
    const pathname = usePathname();

    // Close modal on route change
    useEffect(() => {
        close();
    }, [pathname, close]);

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="w-full sm:max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Upgrade Your Plan</DialogTitle>
                    <DialogDescription className="text-center">
                        Choose a plan that fits your needs to unlock more features.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6">
                    <PricingTable />
                </div>
            </DialogContent>
        </Dialog>
    );
}
