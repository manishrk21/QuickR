import { create } from 'zustand';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  setContext: (restaurantId: string, tableId: string | null) => void;
  clearCart: () => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  restaurantId: null,
  tableId: null,

  setContext: (restaurantId, tableId) =>
    set((state) => ({
      restaurantId,
      tableId,
      cart:
        state.restaurantId && state.restaurantId !== restaurantId ? [] : state.cart,
    })),

  clearCart: () => set({ cart: [] }),

  addToCart: (item) => set((state) => {
    const existingItem = state.cart.find((i) => i.id === item.id);
    if (existingItem) {
      return {
        cart: state.cart.map((i) => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0),
  })),
}));