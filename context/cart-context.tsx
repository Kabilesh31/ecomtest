"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  mainImage?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1️⃣ Load guest cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
    setIsHydrated(true);
  }, []);

  // 2️⃣ Save cart to localStorage
  useEffect(() => {
    if (isHydrated) localStorage.setItem("cart", JSON.stringify(items));
  }, [items, isHydrated]);

  // 3️⃣ Fetch user cart from backend and merge with guest cart
  useEffect(() => {
    const fetchUserCart = async () => {
      if (!user) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/cart`, {
          withCredentials: true,
        });

        let backendCart: CartItem[] = [];
        if (Array.isArray(res.data)) {
          backendCart = res.data.map((item: any) => ({
            id: item.productId?._id || item._id,
            name: item.productId?.name || item.name,
            price: item.productId?.price || item.price,
            mainImage: item.productId?.mainImage,
            quantity: item.quantity,
          }));
        }

        // Merge guest cart with backend cart
        const mergedCart = [...items]; // start with guest cart
        backendCart.forEach((bItem) => {
          const index = mergedCart.findIndex((i) => i.id === bItem.id);
          if (index > -1) {
            // If exists in guest cart, sum quantity
            mergedCart[index].quantity += bItem.quantity;
          } else {
            mergedCart.push(bItem);
          }
        });

        setItems(mergedCart);

        // Sync merged cart to backend
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/cart/save`,
          { cart: mergedCart.map(({ id, quantity }) => ({ productId: id, quantity })) },
          { withCredentials: true }
        );

        // Clear guest cart from localStorage
        localStorage.removeItem("cart");
      } catch (err) {
        console.error("Error fetching user cart:", err);
      }
    };

    fetchUserCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isHydrated]); // run after auth state known

  // 4️⃣ Sync cart to backend whenever it changes for logged-in user
  useEffect(() => {
    if (!user || !isHydrated) return;

    const syncCart = async () => {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/cart/save`,
          { cart: items.map(({ id, quantity }) => ({ productId: id, quantity })) },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Error syncing cart to backend:", err);
      }
    };

    syncCart();
  }, [items, user, isHydrated]);

  // 5️⃣ Clear cart
  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...product, quantity }];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
