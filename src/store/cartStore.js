import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authStorage } from "../utils/authStorage";
import {
  addLadipoCartItem,
  getLadipoCart,
  getLadipoParts,
  removeLadipoCartItem,
  updateLadipoCartItem,
} from "../services/apiLadipo";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      initialized: false,

      initializeCart: async () => {
        if (!authStorage.isAuthenticated()) {
          set({ initialized: true });
          return;
        }

        await get().refreshFromBackend();
      },

      refreshFromBackend: async () => {
        if (!authStorage.isAuthenticated()) {
          set({ initialized: true });
          return;
        }

        try {
          const [cartItems, partsResult] = await Promise.all([
            getLadipoCart(),
            getLadipoParts({ page: 1, limit: 1000 }),
          ]);

          const parts = Array.isArray(partsResult?.parts) ? partsResult.parts : [];
          const partById = new Map(parts.map((part) => [part.id, part]));

          const mappedItems = (Array.isArray(cartItems) ? cartItems : [])
            .map((cartItem) => {
              const part = partById.get(cartItem.product_id);
              if (!part) return null;
              return {
                id: cartItem.id,
                inventoryId: part.inventory_id,
                partId: part.id,
                slug: part.slug,
                name: part.name,
                imageUrl: part.primary_image_url,
                priceKobo: part.price_kobo ?? 0,
                quantity: cartItem.quantity,
              };
            })
            .filter(Boolean);

          set({ items: mappedItems, initialized: true });
        } catch (error) {
          // Keep UI resilient: if backend sync fails, do not wipe local cart.
          set({ initialized: true });
        }
      },

      addItem: async (item) => {
        const addLocal = () => {
          const { items } = get();
          const existing = items.find((i) => i.inventoryId === item.inventoryId);
          if (existing) {
            set({
              items: items.map((i) =>
                i.inventoryId === item.inventoryId
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i,
              ),
            });
          } else {
            set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
          }
        };

        if (authStorage.isAuthenticated()) {
          const productId = item.partId;
          if (!productId) {
            addLocal();
            return;
          }

          // Keep existing UX snappy even when API is slow.
          addLocal();

          try {
            const saved = await addLadipoCartItem({
              product_id: productId,
              quantity: item.quantity || 1,
            });

            const existing = get().items.find((i) => i.partId === productId);
            if (existing) {
              set({
                items: get().items.map((i) =>
                  i.partId === productId ? { ...i, quantity: saved.quantity, id: saved.id } : i,
                ),
              });
            } else {
              set({
                items: [
                  ...get().items,
                  {
                    ...item,
                    id: saved.id,
                    quantity: saved.quantity,
                  },
                ],
              });
            }
          } catch {
            // Keep local optimistic state if sync fails.
          }
          return;
        }

        addLocal();
      },

      removeItem: async (inventoryId) => {
        if (authStorage.isAuthenticated()) {
          const existing = get().items.find((i) => i.inventoryId === inventoryId);
          if (!existing) return;
          if (!existing.id) {
            set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
            return;
          }
          try {
            await removeLadipoCartItem(existing.id);
            set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
          } catch {
            set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
          }
          return;
        }

        set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
      },

      setQty: async (inventoryId, qty) => {
        if (authStorage.isAuthenticated()) {
          const existing = get().items.find((i) => i.inventoryId === inventoryId);
          if (!existing) return;

          if (!existing.id) {
            if (qty <= 0) {
              set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
            } else {
              set({
                items: get().items.map((i) =>
                  i.inventoryId === inventoryId ? { ...i, quantity: qty } : i,
                ),
              });
            }
            return;
          }

          try {
            if (qty <= 0) {
              await removeLadipoCartItem(existing.id);
              set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
            } else {
              const updated = await updateLadipoCartItem(existing.id, { quantity: qty });
              set({
                items: get().items.map((i) =>
                  i.inventoryId === inventoryId ? { ...i, quantity: updated.quantity } : i,
                ),
              });
            }
          } catch {
            if (qty <= 0) {
              set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
            } else {
              set({
                items: get().items.map((i) =>
                  i.inventoryId === inventoryId ? { ...i, quantity: qty } : i,
                ),
              });
            }
          }
          return;
        }

        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
        } else {
          set({
            items: get().items.map((i) =>
              i.inventoryId === inventoryId ? { ...i, quantity: qty } : i,
            ),
          });
        }
      },

      clearCart: async () => {
        if (authStorage.isAuthenticated()) {
          const currentItems = get().items;
          try {
            await Promise.all(
              currentItems
                .filter((item) => item.id)
                .map((item) => removeLadipoCartItem(item.id)),
            );
            set({ items: [] });
          } catch {
            // Keep current state on API failure.
          }
          return;
        }

        set({ items: [] });
      },
    }),
    {
      name: "ladipo-cart",
    },
  ),
);

if (typeof window !== "undefined") {
  useCartStore.getState().initializeCart();
}

export default useCartStore;

// ─── Selectors (use inside components) ───────────────────────────────────────
export const selectTotalKobo = (state) =>
  state.items.reduce((sum, i) => sum + i.priceKobo * i.quantity, 0);

export const selectItemCount = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
