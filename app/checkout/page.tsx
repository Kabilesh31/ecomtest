"use client"

import { ClientLayout } from "@/components/client/client-layout"
import { CheckoutForm } from "@/components/client/checkout-form"
import { CheckoutSummary } from "@/components/client/checkout-summary"
import Link from "next/link"

export default function CheckoutPage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-foreground transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </div>
        </div>

        {/* Page Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase securely</p>
        </div>

        {/* Checkout Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>

            {/* Order Summary */}
            <div>
              <CheckoutSummary />
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
