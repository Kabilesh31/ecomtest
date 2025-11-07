"use client"

import { ClientLayout } from "@/components/client/client-layout"
import { CartItems } from "@/components/client/cart-items"
import { CartSummary } from "@/components/client/cart-summary"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, LogIn } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { items } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // ✅ Check token or user data from localStorage
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const isEmpty = items.length === 0

  return (
    <ClientLayout>
      <div className="min-h-screen bg-background">
        {/* 🧭 Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Shopping Cart</span>
          </div>
        </div>

        {/* 🛍 Page Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review and manage your items</p>
        </div>

        {/* 🔒 User not logged in */}
        {!isLoggedIn ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="p-12 text-center">
              <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Please sign in to view your cart</h2>
              <p className="text-muted-foreground mb-6">
                You need an account to view and manage your cart items.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/account/login">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/account/login/sign-in"> {/* ✅ fixed path */}
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : isEmpty ? (
          // 🛒 Empty cart
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Card className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some products to get started</p>
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </div>
        ) : (
          // ✅ Cart view
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CartItems items={items} />
              </div>
              <div>
                <CartSummary />
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}
