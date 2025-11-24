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
   mainImages: string[]; 
  createdAt:string // ✅ add this field
  outofstock: boolean;
  hidereviews: boolean
  manualRatings?: boolean;
  manualRatingValue?: number;
  noOfClicks?: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);


const itemsPerPage = 8;
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
// 🔍 Filter by name
const filteredProducts = products.filter((p) =>
  p.name.toLowerCase().includes(search.toLowerCase())
);

// 📄 Pagination
const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
const toggleStockStatus = async (id: string, current: boolean) => {
  setUpdating(id);
  try {
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      outofstock: !current,
    });

    setProducts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, outofstock: !current } : p
      )
    );

    toast.success(`Product marked as ${!current ? "OUT OF STOCK" : "IN STOCK"}`);
  } catch (err) {
    toast.error("Failed to update stock status");
  } finally {
    setUpdating(null);
  }
};
const toggleHideReviews = async (id: string, current: boolean) => {
  setUpdating(id);
  try {
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      hidereviews: !current,
    });

    setProducts((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, hidereviews: !current } : p
      )
    );

    toast.success(`Ratings are now ${!current ? "hidden" : "visible"}`);
  } catch (err) {
    toast.error("Failed to update ratings status");
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
<div className="flex justify-between items-center mb-4">
  <Input
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1); // reset to first page on search
    }}
    placeholder="Search by name..."
    className="max-w-xs"
  />
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
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total Clicks</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Created At</th>
                      {/* <th className="px-6 py-3 text-left text-sm font-semibold">Ratings</th> */}
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      {/* <th className="px-6 py-3 text-left text-sm font-semibold">Manual Ratings</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
  {paginatedProducts.map((product) => (
    <tr key={product._id} className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
     {product.mainImages?.length ? (
  <img
    src={product.mainImages[0]}
    alt={product.name}
    className="w-20 h-20 object-cover rounded-md border"
  />
) : (
  <div className="w-20 h-20 flex items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
    No Image
  </div>
)}


          
        </div>
      </td>
      <td className="text-lg px-6 py-2 font-medium">{product.name}</td>
      <td className="px-6 py-2 text-sm text-muted-foreground">{product.category}</td>
      <td className="px-6 py-2 text-sm font-semibold">₹{product.price}</td>
      <td className="px-6 py-2 text-sm font-semibold text-center">{product.quantity}</td>
      <td className="px-6 py-2 text-sm font-semibold text-center">
  {product?.noOfClicks ?? 0}
</td>
     <td className="px-6 py-2">
  <Button
    onClick={() => toggleStockStatus(product._id, product.outofstock)}
    disabled={updating === product._id}
    className={`
      relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-300
      ${product.outofstock ? "bg-red-500" : "bg-green-600"}
      ${updating === product._id && "opacity-50 cursor-not-allowed"}
    `}
  >
    <span
      className={`
        inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-all duration-300
        ${product.outofstock ? "translate-x-0" : "translate-x-4"}
      `}
    />
  </Button>
</td>


      <td className="px-6 py-2 text-sm font-semibold">{product?.createdAt.slice(0, 10).split("-").reverse().join("-")}</td>
      {/* <td className="px-6 py-2">
  <Button
    onClick={() => toggleHideReviews(product._id, product.hidereviews)}
    disabled={updating === product._id}
    className={`
      relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-300
      ${product.hidereviews ? "bg-gray-400" : "bg-yellow-500"}
      ${updating === product._id && "opacity-50 cursor-not-allowed"}
    `}
  >
    <span
      className={`
        inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-all duration-300
        ${product.hidereviews ? "translate-x-0" : "translate-x-4"}
      `}
    />
  </Button>
</td> */}

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
      {/* <td className="px-6 py-2">
  <Button
    onClick={async () => {
      setUpdating(product._id);
      try {
        // Toggle manualRatings
        const newManual = !product.manualRatings;
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`, {
          manualRatings: newManual,
          hidereviews: newManual ? true : product.hidereviews, // auto-hide if manual is on
        });

        setProducts((prev) =>
          prev.map((p) =>
            p._id === product._id
              ? { ...p, manualRatings: newManual, hidereviews: newManual ? true : p.hidereviews }
              : p
          )
        );

        toast.success(`Manual Ratings ${newManual ? "enabled" : "disabled"}`);
      } catch (err) {
        toast.error("Failed to update manual ratings");
      } finally {
        setUpdating(null);
      }
    }}
    disabled={updating === product._id}
    className={`
      relative inline-flex w-14 h-7 items-center rounded-full transition-all duration-300
      ${product.manualRatings ? "bg-yellow-500" : "bg-gray-400"}
      ${updating === product._id && "opacity-50 cursor-not-allowed"}
    `}
  >
    <span
      className={`
        inline-block w-4 h-4 transform rounded-full bg-white shadow-md transition-all duration-300
        ${product.manualRatings ? "translate-x-4" : "translate-x-0"}
      `}
    />
    {product.manualRatings && (
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-white">
        {product.manualRatingValue}
      </span>
    )}
  </Button>
</td> */}


    </tr>
  ))}
</tbody>

                </table>
                <div className="flex justify-center items-center gap-3 py-4">
  <Button
    variant="outline"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => prev - 1)}
  >
    Previous
  </Button>

  <span className="text-sm font-medium">
    Page {currentPage} of {totalPages}
  </span>

  <Button
    variant="outline"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((prev) => prev + 1)}
  >
    Next
  </Button>
</div>

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
