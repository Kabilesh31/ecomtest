"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary() {
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const { items } = useCart() 

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping =  0 // Always free
  const tax = (subtotal - discount) * 0.1
  const total = subtotal - discount + shipping + tax

  const applyCoupon = () => {
    if (couponCode === "SAVE10") {
      setDiscount(subtotal * 0.1)
    } else if (couponCode === "SAVE20") {
      setDiscount(subtotal * 0.2)
    } else {
      alert("Invalid coupon code")
    }
  }

  return (
    <div className="space-y-4 sticky top-24">
      {/* Coupon Code */}
      {/* <Card className="p-4">
        <label className="block text-sm font-medium text-foreground mb-2">Coupon Code</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button onClick={applyCoupon} variant="outline" className="bg-transparent">
            Apply
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Try: SAVE10 or SAVE20</p>
      </Card> */}

      {/* Order Summary */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Order Summary</h3>

        <div className="space-y-3 border-b border-border pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-green-600 dark:text-green-400 font-medium">
                -₹{discount.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="text-foreground font-medium">₹{tax.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex justify-between text-lg">
  <span className="font-semibold text-foreground">Total</span>
  <span className="font-bold text-primary text-xl">
    ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
</div>

        <Link href="/checkout"> 
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold">
            Proceed to Checkout
          </Button>
         </Link> 

        <Link href="/products">
          <Button variant="outline" className="w-full bg-transparent">
            Continue Shopping
          </Button>
        </Link>
      </Card>

      {/* Info Cards */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Free Shipping</span> on orders over ₹
        </p>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">30-Day Returns</span> on all items
        </p>
      </Card>
    </div>
  )
}
