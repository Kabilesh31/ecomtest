"use client";

import { Card } from "@/components/ui/card";
import { useCart, CartItem } from "@/context/cart-context";
import { useEffect, useState } from "react";

export function CheckoutSummary() {
  const { items, discount, appliedCoupon } = useCart(); // get cart items, discount, and applied promo
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Load applied promo discount from localStorage
  useEffect(() => {
    const promo = localStorage.getItem("appliedPromo");
    if (promo) {
      const parsed = JSON.parse(promo);
      setPromoDiscount(parsed.discountAmount || 0);
    }
  }, []);

  // Total discount
  const totalDiscount = discount + promoDiscount;

  // Subtotal before discount
  const subtotal = items.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0
  );

  // Shipping is free
  const shipping = 0;

  // Tax after discount
  const tax = (subtotal - totalDiscount) * 0.1;

  // Total after discount
  const total = subtotal - totalDiscount + shipping + tax;

  return (
    <div className="sticky top-24 space-y-4">
      {/* Order Items */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Order Summary</h3>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">Your cart is empty.</p>
        ) : (
          <div className="space-y-3 border-b border-border pb-4">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-foreground font-medium text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="space-y-3 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cart Discount</span>
                  <span className="text-green-600 font-medium">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Promo Discount ({appliedCoupon || ""})</span>
                  <span className="text-green-600 font-medium">-₹{promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="text-foreground font-medium">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-lg">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-primary text-xl">₹{total.toFixed(2)}</span>
            </div>
          </>
        )}
      </Card>

      {/* Security Info */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">🔒 Secure Checkout</span>
          <br />
          Your information is protected with SSL encryption.
        </p>
      </Card>

      {/* Guarantees */}
      <Card className="p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">✓ 30-Day Money Back Guarantee</p>
        <p className="text-xs font-semibold text-foreground">✓ Free Shipping on Orders Over Rs.300</p>
        <p className="text-xs font-semibold text-foreground">✓ 24/7 Customer Support</p>
      </Card>
    </div>
  );
}
