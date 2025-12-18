"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminLayout } from "@/components/admin/admin-layout";

interface PromoCode {
  _id: string;
  title: string;
  description: string;
  code: string;
  discountValue: number;
  discountType: string;
  expiryDate: string;
  isActive: boolean;
  minOrderAmount: number;
}

export default function AdminPromoCodePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/promocode/auto/monthly`
        );
        await fetchPromoCodes();
      } catch (err) {
        toast.error("Failed to initialize promo codes");
      }
    };

    init();
  }, []);

  const toggleAutoPromo = async (promo: PromoCode) => {
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/promocode/toggle/${promo._id}`
    );
    toast.success("Status updated");
    fetchPromoCodes();
  };

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/promocode/`
      );
      setPromoCodes(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error("Failed to fetch promo codes");
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !code || !discount || !expiry) {
      toast.error("All fields are required");
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/promocode/create`, {
        title,
        description,
        code,
        discountValue: Number(discount),
        discountType: "percentage",
        expiryDate: new Date(expiry).toISOString(),
      });

      toast.success("Promocode created successfully");

      setTitle("");
      setDescription("");
      setCode("");
      setDiscount("");
      setExpiry("");

      fetchPromoCodes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create promocode");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/promocode/${id}`
      );
      if (res.data.success) {
        toast.success("Promo code deleted successfully");
        fetchPromoCodes();
      } else {
        toast.error(res.data.message || "Failed to delete promo code");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete promo code"
      );
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6 max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-center">Promo Codes</h1>

          {/* Create Promo */}
          <div className="space-y-4 border p-4 rounded shadow">
            <h2 className="font-semibold text-lg">Create Promo Code</h2>

            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Festival Discount"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the promo..."
              />
            </div>

            <div>
              <Label>Promo Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="DIWALI2025"
              />
            </div>

            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="10"
              />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Promo Code"}
            </Button>
          </div>

          {/* Existing Promo Codes */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Existing Promo Codes</h2>

            {loading ? (
              <p>Loading promo codes...</p>
            ) : promoCodes.length > 0 ? (
              promoCodes.map((promo) => (
                <div
                  key={promo._id}
                  className="p-3 border rounded flex flex-col md:flex-row justify-between items-start md:items-center mb-3"
                >
                  <div>
                    <p className="font-medium">{promo.title}</p>
                    <p className="text-sm text-gray-500">{promo.description}</p>
                    <p className="text-sm text-gray-500">Code: {promo.code}</p>
                    <p className="text-sm">
                      Discount: {promo.discountValue} ({promo.discountType})
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(promo.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        promo.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(promo._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p>No promo codes yet.</p>
            )}
          </div>
          {promoCodes
            .filter((p) => /^[a-z]{3}\d{4}$/i.test(p.code))
            .map((auto) => (
              <div
                key={auto._id}
                className="p-3 border rounded bg-blue-50 flex justify-between items-center mb-3"
              >
                <div>
                  <p className="font-medium">{auto.title}</p>
                  <p className="text-sm text-gray-600">Code: {auto.code}</p>
                  <p className="text-sm">Discount: {auto.discountValue}%</p>
                  <p className="text-sm text-gray-600">
                    Expires: {new Date(auto.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  className={auto.isActive ? "bg-red-500" : "bg-green-500"}
                  onClick={() => toggleAutoPromo(auto)}
                >
                  {auto.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
