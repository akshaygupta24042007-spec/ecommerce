import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariant } from './types';

export interface CartItem {
  cartItemId: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      
      addItem: (product, variant, quantity = 1) => set((state) => {
        const variantId = variant?.id || 'default';
        const cartItemId = `${product.id}-${variantId}`;
        const existingItem = state.items.find(item => item.cartItemId === cartItemId);
        
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.cartItemId === cartItemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            isOpen: true,
          };
        }
        
        return {
          items: [...state.items, { cartItemId, product, variant, quantity }],
          isOpen: true,
        };
      }),

      removeItem: (cartItemId) => set((state) => ({
        items: state.items.filter(item => item.cartItemId !== cartItemId)
      })),

      updateQuantity: (cartItemId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      })),

      clearCart: () => set({ items: [] }),
      setIsOpen: (isOpen) => set({ isOpen }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'hiya-cart',
      partialize: (state) => ({ items: state.items }), // Persist cart items across reloads
    }
  )
);
