"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  mainImages?: string[];
  quantity: number;
  stock?: number; // total stock from backend
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

let ws: WebSocket | null = null;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("cart");
    if (saved) setItems(JSON.parse(saved));
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  // Setup WebSocket (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function connect() {
      ws = new WebSocket("ws://localhost:5000");

      ws.onopen = () => console.log("WebSocket connected");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "stockUpdate") {
          setItems(prev =>
            prev.map(item =>
              item.id === data.productId ? { ...item, stock: data.stock } : item
            )
          );
        } else if (data.type === "stockUpdateBatch") {
          setItems(prev =>
            prev.map(item => {
              const update = data.updates.find((u: any) => u.productId === item.id);
              return update ? { ...item, stock: update.stock } : item;
            })
          );
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected, reconnecting in 3s...");
        setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws?.close();
      };
    }

    connect();

    return () => ws?.close();
  }, []);

  // Cart actions
  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        const maxStock = product.stock ?? Infinity;

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, maxStock);
          return prev.map(i =>
            i.id === product.id ? { ...i, quantity: newQty } : i
          );
        }

        return [...prev, { ...product, quantity: Math.min(quantity, maxStock) }];
      });
    },
    []
  );

  const removeFromCart = useCallback((id: string | number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string | number, quantity: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const maxStock = item.stock ?? Infinity;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") localStorage.removeItem("cart");
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
