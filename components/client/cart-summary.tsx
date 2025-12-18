"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "@/context/cart-context";
import toast from "react-hot-toast";

export function CartSummary() {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
const [promoError, setPromoError] = useState<string>("");
  const { items, discount, appliedCoupon, applyCoupon } = useCart(); // ✅ use discount from context

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0;
  const discountAmount = appliedCoupon ? discount : 0; // discount is already ₹
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.1;
  const total = taxableAmount + tax + shipping;

const handleApplyCoupon = async () => {
  if (!couponCode.trim()) {
    setPromoError("Please enter a promo code");
    return;
  }

  setPromoError("");
  setLoading(true);

  try {
    const response = await axios.post(
      "http://localhost:5000/api/promocode/apply",
      {
        code: couponCode,
        products: items.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
      }
    );

    if (response.data.success) {
      const discountInRupees = response.data.discount;

      applyCoupon(couponCode, discountInRupees);

      // ✅ SUCCESS → TOAST ONLY
      toast.success(`Promo applied! You saved ₹${discountInRupees}`);
    } else {
      // ❌ ERROR → INLINE MESSAGE ONLY
      setPromoError(response.data.message || "Invalid promo code");
    }
  } catch (err) {
    // ❌ API ERROR → INLINE MESSAGE ONLY
    setPromoError("Invalid or expired promo code");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-4 sticky top-24">
      {!discount ? (
        <Card className="p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Promo Code
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter promo code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Applying..." : "Apply"}
            </Button>
          </div>
          {promoError && (
  <p className="text-xs text-red-500 mt-1">{promoError}</p>
)}
        </Card>
      ) : (
        <Card className="p-4 bg-green-50 border-green-300">
          <div className="flex justify-between items-center">
            <span className="text-green-700 font-medium">
              Promo applied: {appliedCoupon}
            </span>
            <button
              onClick={() => applyCoupon("", 0)}
              className="text-red-600 underline text-xs"
            >
              Remove
            </button>
          </div>
          

        </Card>
      )}

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg text-foreground">Order Summary</h3>

        <div className="space-y-3 border-b border-border pb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Discount ({appliedCoupon})
              </span>
              <span className="text-green-600 font-medium">
                -₹{discountAmount.toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="text-foreground font-medium">
              ₹{tax.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-lg">
          <span className="font-semibold text-foreground">Total</span>
          <span className="font-bold text-primary text-xl">
            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <Link href="/checkout">
          <Button className="w-full bg-primary text-primary-foreground py-6 text-lg font-semibold">
            Proceed to Checkout
          </Button>
        </Link>

        <Link href="/products">
          <Button variant="outline" className="w-full bg-transparent">
            Continue Shopping
          </Button>
        </Link>
      </Card>
    </div>
  );
}
