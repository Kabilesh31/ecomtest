"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { motion } from "framer-motion";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, discount: cartDiscount, appliedCoupon } = useCart();
  const { user } = useAuth();

  const [localUser, setLocalUser] = useState(user);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  // Load promo from localStorage
  useEffect(() => {
    const promo = localStorage.getItem("appliedPromo");
    if (promo) setAppliedPromo(JSON.parse(promo));
  }, []);

  // Update local user if auth changes
  useEffect(() => {
    if (user) setLocalUser(user);
  }, [user]);

  // Fetch addresses if empty
  useEffect(() => {
    if (localUser && addresses.length === 0) fetchAddresses();
  }, [localUser]);

  // Subtotal
// Ensure all items are numbers
const subtotal = items.reduce((sum, item) => {
  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 0;
  return sum + price * quantity;
}, 0);

// Ensure discounts are numbers
const cartDiscountAmount = Number(cartDiscount) || 0;
const promoDiscountAmount = Number(appliedPromo?.discountAmount) || 0;

// Total discount
const totalDiscount = cartDiscountAmount + promoDiscountAmount;

// Shipping
const shipping = 0;

// Taxable amount (subtotal minus discounts)
const taxableAmount = subtotal - totalDiscount;

// Tax (10% of taxable amount)
const tax = +(taxableAmount * 0.1).toFixed(2);

// Total payable amount
const total = +(taxableAmount + shipping + tax).toFixed(2);

// Debug log
console.log({
  subtotal,
  cartDiscountAmount,
  promoDiscountAmount,
  totalDiscount,
  taxableAmount,
  tax,
  total
});




  // Fetch saved addresses
  const fetchAddresses = async () => {
    if (!localUser?._id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/users/getSavedAddress/${localUser._id}`);
      if (res.data.success) {
        setAddresses(res.data.addressList);
        setShowForm(res.data.addressList.length === 0);
      }
    } catch (err: any) {
      console.error("Fetch address error:", err.response?.data || err.message);
    }
  };

  // Save new address
  const saveUserAddress = async () => {
    if (!localUser) return;

    const address = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      add: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.zipCode,
      country: formData.country,
    };

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/saveAddress/${localUser._id}`,
        { address }
      );

      if (res.data.success) {
        await fetchAddresses();
        setShowForm(false);
        const latest = res.data.addressList[res.data.addressList.length - 1];
        setSelectedAddress(latest);
        alert("Address added successfully!");
      }
    } catch (err: any) {
      console.error("Save address error:", err.response?.data || err.message);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
  };

  const handleCreateNewAddress = () => {
    setShowForm(true);
    setSelectedAddress(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (showForm) {
        await saveUserAddress();
      }

      const purchasedProducts = items.map((item: CartItem) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const customerAddress = selectedAddress
        ? {
            firstName: selectedAddress.firstName,
            lastName: selectedAddress.lastName,
            email: selectedAddress.email,
            phone: selectedAddress.phone,
            address: selectedAddress.add,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
            country: selectedAddress.country,
          }
        : {
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

      if (paymentMethod === "COD") {
        const codOrder = await axios.post("http://localhost:5000/api/order/createCODOrder", {
          customerId: localUser?._id,
          totalAmount: total,
          purchasedProducts,
          customerDetails: customerAddress,
          paymentMode: "COD",
          appliedCoupon: appliedPromo?.code || null,
          discountAmount: totalDiscount,
        });

        if (codOrder.data.success) {
          alert("Order placed successfully with Cash on Delivery!");
          router.push("/order-success");
          localStorage.removeItem("appliedPromo");
        } else {
          alert("Failed to place COD order.");
        }

        return;
      }

      // Razorpay payment
      const orderResponse = await axios.post("http://localhost:5000/api/order/createOrder", {
        amount: total,
        appliedCoupon: appliedPromo?.code || null,
        discountAmount: totalDiscount,
      });

      const data = orderResponse.data;

      if (!data.success || !data.orderId) throw new Error("Unable to create Razorpay order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Ecom Store",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await axios.post("http://localhost:5000/api/order/verifyPayment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              totalAmount: total,
              customerId: localUser?._id,
              purchasedProducts,
              customerDetails: customerAddress,
              appliedCoupon: appliedPromo?.code || null,
              discountAmount: totalDiscount,
            });

            if (verifyResponse.data.success) {
              alert("Payment Verified Successfully!");
              router.push("/order-success");
            } else {
              alert("Payment verification failed!");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: `${customerAddress.firstName} ${customerAddress.lastName}`,
          email: customerAddress.email,
          contact: customerAddress.phone,
        },
        notes: {
          address: `${customerAddress.address}, ${customerAddress.city}`,
        },
        theme: { color: "#0d9488" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
      });
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!localUser) return <div className="text-center mt-10 text-lg">Loading user details...</div>;

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>

          {/* If user has saved addresses, show them */}
          {addresses.length > 0 && !showForm && (
            <>
              <div className="space-y-3">
                {addresses.map((addr, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectAddress(addr)}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      selectedAddress?._id === addr._id ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                  >
                    <p className="font-medium">
                      {addr.firstName} {addr.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Address : {addr.add}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-600">Country : {addr.country}</p>
                    <p className="text-sm text-gray-600">Phone : {addr.phone}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button type="button" onClick={handleCreateNewAddress}>
                  + Add New Address
                </Button>
              </div>
            </>
          )}

          {/* Show address form if no address or adding new one */}
          {(showForm || addresses.length === 0) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" required />
              <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" />
              <Input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
              <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone" required />
              <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required className="md:col-span-2" />
              <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" required />
              <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" required />
              <Input name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Zip Code" required />
              <Input name="country" value={formData.country} onChange={handleInputChange} placeholder="Country" required />
            </div>
          )}
        </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

            <div className="space-y-4">

              {/* Online Payment */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod("ONLINE")}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                  ${paymentMethod === "ONLINE" ? "border-primary bg-primary/10 shadow-md" : "border-gray-300 bg-white"}
                `}
              >
                {/* Custom Radio */}
                <div className="relative">
                  <div
                    className={`
                      h-5 w-5 rounded-full border-2 flex items-center justify-center
                      ${paymentMethod === "ONLINE" ? "border-primary" : "border-gray-400"}
                    `}
                  >
                    {paymentMethod === "ONLINE" && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-3 w-3 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold">Online Payment</p>
                  <p className="text-sm text-gray-500">Pay securely using Razorpay</p>
                </div>
              </motion.div>

              {/* COD Payment */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod("COD")}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all
                  ${paymentMethod === "COD" ? "border-primary bg-primary/10 shadow-md" : "border-gray-300 bg-white"}
                `}
              >
                {/* Custom Radio */}
                <div className="relative">
                  <div
                    className={`
                      h-5 w-5 rounded-full border-2 flex items-center justify-center
                      ${paymentMethod === "COD" ? "border-primary" : "border-gray-400"}
                    `}
                  >
                    {paymentMethod === "COD" && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="h-3 w-3 rounded-full bg-primary"
                      />
                    )}
                  </div>
                </div>

                <div> 
                  <p className="font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500">Pay after delivery</p>
                </div>
              </motion.div>

            </div>
          </Card>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
        >
          {isLoading ? "Processing..." : "Continue to Payment"}
        </Button>
        

      </form>
    )
  }
