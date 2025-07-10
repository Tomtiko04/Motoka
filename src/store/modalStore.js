import { create } from "zustand";

const useModalStore = create((set) => ({
  isOpen: false,
  onConfirm: null,
  carDetail: null,
  showModal: (onConfirm, cardetail) => set({ isOpen: true, carDetail: cardetail, onConfirm }),
  hideModal: () => set({ isOpen: false, onConfirm: null }),
}));

export default useModalStore;
