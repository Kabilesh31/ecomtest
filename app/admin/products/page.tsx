"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Plus } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  mainImage?: string; // ✅ add this field
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 🟢 Fetch products from API
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🟠 Delete product
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      toast.success(" Product deleted successfully");
      setDeleteId(null);
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data || err.message);
      toast.error(" Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  // 🟣 Update quantity
  const handleQuantityChange = async (id: string, value: number) => {
    setUpdating(id);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, { quantity: value });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, quantity: value } : p))
      );
      toast.success("Quantity updated");
    } catch (err) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  return (
   <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <AdminHeader title="Products" description="Manage your product catalog" />
            <Link href="/admin/products/add">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold"></th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Created At</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
  {products.map((product) => (
    <tr key={product._id} className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <img
            src={
              product.mainImage?.startsWith("http")
                ? product.mainImage
                : product.mainImage
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${product.mainImage}`
                : "/placeholder.svg"
            }
            alt={product.name}
            className="w-20 h-18 object-cover rounded-md"
          />
          
        </div>
      </td>
      <td className="text-lg px-6 py-2 font-medium">{product.name}</td>
      <td className="px-6 py-2 text-sm text-muted-foreground">{product.category}</td>
      <td className="px-6 py-2 text-sm font-semibold">₹{product.price}</td>
      <td className="px-6 py-2 text-sm font-semibold">{product.quantity}</td>
      <td className="px-6 py-2 text-sm font-semibold">{product?.createdAt.slice(0, 10).split("-").reverse().join("-")}</td>
      <td className="px-6 py-2">
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${product._id}/edit`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Edit2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(product._id)}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

                </table>
              </div>
            )}
          </Card>
        </div>
        {deleteId && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-xl max-w-sm w-full text-center">
      <h2 className="text-lg font-semibold mb-2">Delete Product?</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Are you sure you want to delete this product? This action cannot be undone.
      </p>
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => setDeleteId(null)}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteConfirm}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  </div>
)}
      </AdminLayout>
      </ProtectedRoute>
   
  );
}
