"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminLayout } from "@/components/admin/admin-layout";

interface PromoCode {
  _id: string;
  title: string;
  code: string;
  discountValue: number;
  discountType: string;
  expiryDate: string;
  isActive: boolean;
  applicableProducts: string[];
  minOrderAmount: number;
}

export default function PromoCodePage() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch promo codes
  const fetchPromoCodes = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/promocode/`);
    // access the 'data' field from your backend response
    const data = res.data?.data || [];
    setPromoCodes(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch promo codes");
    setPromoCodes([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Create new promo code
  const handleSubmit = async () => {
    if (!title || !code || !discount || !expiry) {
      toast.error("All fields are required");
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/promocode/create`, {
        title,
        code,
        discountValue: Number(discount),
        discountType: "percentage",
        expiryDate: new Date(expiry).toISOString(),
      });

      toast.success("Promocode created successfully");

      // Reset form
      setTitle("");
      setCode("");
      setDiscount("");
      setExpiry("");

      fetchPromoCodes();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create promocode");
    } finally {
      setCreating(false);
    }
  };

  return (

    <ProtectedRoute>
          <AdminLayout>
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Promo Codes</h1>

      {/* Create Promo Form */}
      <div className="space-y-4 border p-4 rounded shadow">
        <h2 className="font-semibold text-lg">Create Promo Code</h2>

        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Festival Discount" />
        </div>

        <div>
          <Label>Promo Code</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DIWALI2025" />
        </div>

        <div>
          <Label>Discount (%)</Label>
          <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="10" />
        </div>

        <div>
          <Label>Expiry Date</Label>
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>

        <Button className="w-full mt-4" onClick={handleSubmit} disabled={creating}>
          {creating ? "Creating..." : "Create Promo Code"}
        </Button>
      </div>

      {/* Display Promo Codes */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Existing Promo Codes</h2>

        {loading ? (
          <p>Loading promo codes...</p>
        ) : promoCodes.length > 0 ? (
          promoCodes.map((promo) => (
            <div key={promo._id} className="p-3 border rounded flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
              <div>
                <p className="font-medium">{promo.title}</p>
                <p className="text-sm text-gray-500">Code: {promo.code}</p>
                <p className="text-sm">Discount: {promo.discountValue} ({promo.discountType})</p>
                <p className="text-sm text-gray-500">Expires: {new Date(promo.expiryDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Minimum Order: ₹{promo.minOrderAmount}</p>
                <p className="text-sm text-gray-500">Applicable Products: {promo.applicableProducts.length > 0 ? promo.applicableProducts.join(", ") : "All Products"}</p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className={`px-2 py-1 rounded text-white ${promo.isActive ? "bg-green-500" : "bg-red-500"}`}>
                  {promo.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No promo codes yet.</p>
        )}
      </div>
    </div>
    </AdminLayout>
    </ProtectedRoute>
  );
}
