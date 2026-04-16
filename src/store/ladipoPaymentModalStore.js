import { create } from "zustand";

/**
 * Global Ladipo checkout UI: processing, success, and receipt modals (not full pages).
 */
export const useLadipoPaymentModalStore = create((set) => ({
  isOpen: false,
  phase: null, // 'processing' | 'success'
  amountKobo: 0,
  order: null,
  receiptOpen: false,

  openProcessing: (amountKobo) =>
    set({
      isOpen: true,
      phase: "processing",
      amountKobo: Number(amountKobo) || 0,
      order: null,
      receiptOpen: false,
    }),

  openSuccess: ({ order, amountKobo }) =>
    set({
      isOpen: true,
      phase: "success",
      order,
      receiptOpen: false,
      amountKobo:
        Number(amountKobo) ||
        Number(order?.total_kobo) ||
        0,
    }),

  openReceipt: () =>
    set((s) => (s.order ? { receiptOpen: true } : {})),

  closeReceipt: () => set({ receiptOpen: false }),

  close: () =>
    set({
      isOpen: false,
      phase: null,
      order: null,
      amountKobo: 0,
      receiptOpen: false,
    }),
}));
