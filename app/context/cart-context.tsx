"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: string | number
  name: string
  price: number
  image?: string
  mainImage?:string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: CartItem | Omit<CartItem, "quantity">, quantity?: number) => void
  removeFromCart: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalQuantity: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // ✅ Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (err) {
        console.error("Failed to parse cart:", err)
        localStorage.removeItem("cart")
      }
    }
    setIsHydrated(true)
  }, [])

  // ✅ Save to localStorage when items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isHydrated])

  // ✅ Add or increase item
  const addToCart = (product: CartItem | Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  // ✅ Remove item entirely
  const removeFromCart = (id: string | number) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  // ✅ Update item quantity directly
  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  // ✅ Clear all items
  const clearCart = () => setItems([])

  // ✅ Derived values
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalQuantity,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
