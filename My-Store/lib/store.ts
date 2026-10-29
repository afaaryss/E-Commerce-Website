import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Sekarang gabungan dari "ID Barang - Ukuran" (cth: "1-M")
  originalId: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size: string;
  selected: boolean; // Untuk menampung status checklist
}

interface CartState {
  items: CartItem[];
  savedCarts: Record<string, CartItem[]>;
  addItem: (product: Omit<CartItem, 'id' | 'selected'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  updateSize: (id: string, newSize: string) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: (select: boolean) => void;
  checkoutSelected: () => void;
  saveAndClearCart: (userId: string) => void;
  restoreCart: (userId: string) => void;
  
  // ---> TAMBAHAN: Daftarkan clearCart di sini <---
  clearCart: () => void; 
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      savedCarts: {},

      addItem: (product) => set((state) => {
        const uniqueId = `${product.originalId}-${product.size}`;
        const existing = state.items.find((item) => item.id === uniqueId);
        
        if (existing) {
          return {
            items: state.items.map((item) => 
              item.id === uniqueId ? { ...item, quantity: item.quantity + product.quantity } : item
            )
          };
        }
        return { items: [...state.items, { ...product, id: uniqueId, selected: true }] };
      }),
      
      removeItem: (id) => set((state) => ({
         items: state.items.filter((item) => item.id !== id)
      })),
      
      updateQuantity: (id, qty) => set((state) => ({
         items: state.items.map((item) => item.id === id ? { ...item, quantity: qty } : item)
      })),
      
      updateSize: (id, newSize) => set((state) => {
         const itemToUpdate = state.items.find(i => i.id === id);
         if (!itemToUpdate) return { items: state.items };

         const newId = `${itemToUpdate.originalId}-${newSize}`;
         const existingWithNewSize = state.items.find(i => i.id === newId && i.id !== id);

         if (existingWithNewSize) {
            return {
                items: state.items
                  .map(i => i.id === newId ? { ...i, quantity: i.quantity + itemToUpdate.quantity } : i)
                  .filter(i => i.id !== id)
            }
         } else {
             return { items: state.items.map(i => i.id === id ? { ...i, size: newSize, id: newId } : i) }
         }
      }),
      
      toggleSelect: (id) => set((state) => ({
         items: state.items.map((item) => item.id === id ? { ...item, selected: !item.selected } : item)
      })),
      
      toggleSelectAll: (select) => set((state) => ({
         items: state.items.map((item) => ({ ...item, selected: select }))
      })),
      
      checkoutSelected: () => set((state) => ({
         items: state.items.filter((item) => !item.selected)
      })),

      saveAndClearCart: (userId) => set((state) => ({
        savedCarts: { ...state.savedCarts, [userId]: state.items },
        items: []
      })),

      restoreCart: (userId) => set((state) => ({
        items: state.savedCarts[userId] || []
      })),

      // ---> TAMBAHAN: Logika clearCart <---
      clearCart: () => set({ items: [] }),

    }),
    { name: 'cart-storage' }
  )
);

// AuthState tidak perlu diubah
interface AuthState {
  user: any | null;
  setUser: (user: any | null) => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoginModalOpen: false, 
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));