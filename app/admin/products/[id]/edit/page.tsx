"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
import { toast } from "react-hot-toast";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    createdAt: "",
  });

  const [mainImages, setMainImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  const categories = ["Devine", "Cosmetics", "Accessories"];

  // 🟢 Fetch product details
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch product");

        setProduct({
          name: data.name || "",
          price: data.price || "",
          quantity: data.quantity || "",
          category: data.category || "",
          createdAt: data.createdAt || "",
        });

        setExistingImages(data.mainImages || []);
        setDescriptions(data.descriptions || []);
        setFeatures(data.features || []);
      } catch (error) {
        console.error("Failed to load product", error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 🧩 Handle basic input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // 🧩 Handle description / feature updates
  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // 🧩 Handle image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setMainImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  // 🧩 Remove a newly selected image (before upload)
  const removeNewImage = (index: number) => {
    setMainImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 🧩 Remove existing image (from server set)
  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  // 🧩 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("category", product.category);
    formData.append("descriptions", JSON.stringify(descriptions));
    formData.append("features", JSON.stringify(features));
    formData.append("existingImages", JSON.stringify(existingImages));

    // append new images
    mainImages.forEach((file) => {
      formData.append("mainImages", file);
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(" Product updated successfully!");
        router.push("/admin/products");
      } else {
        toast.error("❌ " + (data.message || "Failed to update product."));
      }
    } catch (err) {
      console.error(err);
      toast.error(" Something went wrong while updating.");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading product...</p>;

  return (
    <AdminLayout>
      <AdminHeader title="Edit Product" />
      <div className="max-w-4xl mx-auto py-10">
        <Card>
          <CardContent className="space-y-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-900 rounded-md hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 🧩 Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input name="name" placeholder="Product Name" value={product.name} onChange={handleInputChange} required />
                <Input name="price" type="number" placeholder="Price" value={product.price} onChange={handleInputChange} required />
                <Input name="quantity" type="number" placeholder="Quantity" value={product.quantity} onChange={handleInputChange} required />
                <div>
                  {/* <label className="block text-sm font-medium mb-1">Category</label> */}
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 🧩 Main Images */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Main Product Images
                </label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {existingImages.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${i + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New images */}
                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-24 h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="mt-2" />
                <p className="text-sm text-gray-400 mt-1">
                  You can add or replace multiple transparent PNG images.
                </p>
              </div>

              {/* 🧩 Descriptions */}
              <div>
                <h2 className="font-semibold mb-2">Descriptions</h2>
                {descriptions.map((desc, i) => (
                  <Textarea
                    key={i}
                    placeholder={`Description ${i + 1}`}
                    value={desc}
                    onChange={(e) => handleArrayChange(i, e.target.value, setDescriptions)}
                    className="mb-2"
                  />
                ))}
              </div>

              {/* 🧩 Features */}
              <div>
                <h2 className="font-semibold mb-2">Features</h2>
                {features.map((feat, i) => (
                  <Textarea
                    key={i}
                    placeholder={`Feature ${i + 1}`}
                    value={feat}
                    onChange={(e) => handleArrayChange(i, e.target.value, setFeatures)}
                    className="mb-2"
                  />
                ))}
              </div>

              <Button type="submit" className="w-full">
                Update Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
