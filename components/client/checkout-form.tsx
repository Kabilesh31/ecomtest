"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"


declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const {items} = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping =  0 
  const tax = (subtotal - discount) * 0.1
  const total = subtotal - discount + shipping + tax


  const [formData, setFormData] = useState({
    // Shipping
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",

    // Billing
    sameAsShipping: true,
    billingFirstName: "",
    billingLastName: "",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",

    // Payment
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // 1️⃣ Save shipping (and billing) address to user profile
    const addressPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: formData.country,
    };

    const addressResponse = await fetch("/auth/address", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: addressPayload }),
    });

    const addressData = await addressResponse.json();
    if (!addressResponse.ok) {
      throw new Error(addressData.message || "Failed to save address");
    }

    console.log("Address saved:", addressData.user.address);

    // 2️⃣ Proceed to Razorpay payment
    const razorpayResponse = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    });

    const razorpayData = await razorpayResponse.json();
    if (!razorpayData.orderId) {
      throw new Error("Unable to create Razorpay order");
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: total,
      currency: "INR",
      name: "Ecom",
      description: "Order Payment",
      order_id: razorpayData.orderId,
      handler: function (response: any) {
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        router.push("/order-success");
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      notes: {
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
      },
      theme: { color: "#0d9488" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error("Checkout Error:", error);
    alert((error as Error).message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Shipping Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
            <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
            <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
            <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Address</label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Street address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City</label>
            <Input type="text" name="city" value={formData.city} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">State</label>
            <Input type="text" name="state" value={formData.state} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
            <Input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Country</label>
            <Input type="text" name="country" value={formData.country} onChange={handleInputChange} required />
          </div>
        </div>
      </Card>

      {/* Billing Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="sameAsShipping"
            name="sameAsShipping"
            checked={formData.sameAsShipping}
            onChange={handleInputChange}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="sameAsShipping" className="text-sm font-medium text-foreground">
            Billing address same as shipping
          </label>
        </div>

        {!formData.sameAsShipping && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
              <Input
                type="text"
                name="billingFirstName"
                value={formData.billingFirstName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <Input type="text" name="billingLastName" value={formData.billingLastName} onChange={handleInputChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Address</label>
              <Input type="text" name="billingAddress" value={formData.billingAddress} onChange={handleInputChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <Input type="text" name="billingCity" value={formData.billingCity} onChange={handleInputChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <Input type="text" name="billingState" value={formData.billingState} onChange={handleInputChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Zip Code</label>
              <Input type="text" name="billingZipCode" value={formData.billingZipCode} onChange={handleInputChange} />
            </div>
          </div>
        )}
      </Card>

      {/* Payment Information */}
      {/* <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cardholder Name</label>
            <Input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
            <Input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
              <Input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
              <Input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            Your payment information is secure and encrypted. We never store your full card details.
          </p>
        </div>
      </Card> */}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold"
      >
        {isLoading ? "Processing..." : "Complete Purchase"}
      </Button>
    </form>
  )
}
