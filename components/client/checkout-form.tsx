"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import axios from "axios"

declare global {
  interface Window {
    Razorpay: any
  }
}

export function CheckoutForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null)

  const { items } = useCart()
  const { user } = useAuth()
  const [localUser, setLocalUser] = useState(user)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0
  const discount = 0
  const tax = (subtotal - discount) * 0.1
  const total = subtotal - discount + shipping + tax

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
  })

  //Fetch addresses from backend
  const fetchAddresses = async () => {
    if (!localUser?._id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/getSavedAddress/${localUser._id}`
      );

      // Axios automatically parses JSON
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


  useEffect(() => {
    if (user) {
      setLocalUser(user)
    }
  }, [user])

  useEffect(()=> {
    if(addresses.length === 0){
      fetchAddresses()
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address)
  }

  const handleCreateNewAddress = () => {
    setShowForm(true)
    setSelectedAddress(null)
  }


  

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {

    if (showForm) {
      await saveUserAddress();
    }

 
    const response = await axios.post("http://localhost:5000/api/order/createOrder", {
      amount: total,
    });

    const data = response.data;

    if (!data.success || !data.orderId) {
      throw new Error("Unable to create Razorpay order");
    }

    const purchasedProducts = items.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const customerAddress = selectedAddress
      ? {
          firstName: selectedAddress.firstNamee,
          lastName: selectedAddress.lastName,
          email: selectedAddress.email,
          phone: selectedAddress.phone,
          address: selectedAddress.add,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.pincode,
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
          });

          const verifyData = verifyResponse.data;

          if (verifyData.success) {
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

    // Handle failed payments
    rzp.on("payment.failed", function (response: any) {
      alert("Payment Failed: " + response.error.description);
    });
  } catch (error: any) {
    console.error("Razorpay Checkout Error:", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  if (!localUser) {
    return <div className="text-center mt-10 text-lg">Loading user details...</div>
  }

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
