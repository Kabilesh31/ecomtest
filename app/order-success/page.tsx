"use client"

import { ClientLayout } from "@/components/client/client-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Package, Truck, Mail } from "lucide-react"
import { useEffect } from "react"
import { useCart } from "@/context/cart-context"

export default function OrderSuccessPage() {

   const { clearCart } = useCart()

  useEffect(() => {
  clearCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  return (
    <ClientLayout>
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <div className="max-w-2xl w-full px-4">
          {/* Success Card */}
          <Card className="p-8 md:p-12 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Message */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground text-lg">Thank you for your purchase</p>
            </div>

            {/* Order Details */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-semibold text-foreground">#ORD-2025-001234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span className="font-semibold text-foreground">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold text-foreground">$1,009.99</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-semibold text-foreground">3-5 Business Days</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4 py-6">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="w-1 h-12 bg-primary/20 my-2"></div>
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-foreground">Order Confirmed</p>
                  <p className="text-sm text-muted-foreground">Your order has been received</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="w-1 h-12 bg-primary/20 my-2"></div>
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-foreground">Processing</p>
                  <p className="text-sm text-muted-foreground">We're preparing your items</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Shipped</p>
                  <p className="text-sm text-muted-foreground">On its way to you</p>
                </div>
              </div>
            </div>

            {/* Confirmation Email */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Confirmation email sent</p>
                <p className="text-xs text-muted-foreground">Check your email for order details and tracking info</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/products" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Back to Home</Button>
              </Link>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="mt-6 p-6 text-center">
            <p className="text-muted-foreground mb-4">Need help with your order?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact">
                <Button variant="outline" className="bg-transparent">
                  Contact Support
                </Button>
              </Link>
              <Link href="/track-order">
                <Button variant="outline" className="bg-transparent">
                  Track Order
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}
