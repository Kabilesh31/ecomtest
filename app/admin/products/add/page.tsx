"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AddProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [descriptions, setDescriptions] = useState(["", "", ""]);
  const [features, setFeatures] = useState(["", "", "", ""]); // ✅ Now 4 feature fields

  const categories = ["Devine", "Cosmetics", "Accessories"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

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

  // 🧩 Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("category", product.category);
    if (mainImage) formData.append("mainImage", mainImage);
    formData.append("descriptions", JSON.stringify(descriptions));
    formData.append("features", JSON.stringify(features));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Product added successfully!");
        setProduct({ name: "", price: "", quantity: "", category: "" });
        setMainImage(null);
        setPreviewUrl(null);
        setDescriptions(["", "", ""]);
        setFeatures(["", "", "", ""]);
      } else {
        toast.error("Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while adding product.");
    }
  };

  const FileButton = () => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleClick = () => inputRef.current?.click();

    return (
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleClick}>
          Choose Product Image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) {
              setMainImage(selected);
              setPreviewUrl(URL.createObjectURL(selected));
            }
          }}
        />
      </div>
    );
  };

  return (
    <AdminLayout>
      <AdminHeader title="Add New Product" />
      <div className="max-w-4xl mx-auto py-10">
        <Card>
          <CardContent className="space-y-8">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-900 rounded-md hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              ← Back
            </button>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={product.price}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="quantity"
                  type="number"
                  placeholder="Quantity"
                  value={product.quantity}
                  onChange={handleInputChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
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

              <div>
                <label className="block text-sm font-medium mb-2">
                 <span className="text-orange-600 text-2xl">*</span> Main Product Image
                </label>
                <FileButton />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-20 h-20 object-cover mt-2 rounded-md border"
                  />
                )}
                <p className="text-sm text-gray-400 mt-2">image must be a Transperant PNG </p>
              </div>

              <div>
                <h2 className="font-semibold mb-2">Descriptions</h2>
                {descriptions.map((desc, i) => (
                  <Textarea
                    key={i}
                    placeholder={`Description ${i + 1}`}
                    value={desc}
                    onChange={(e) =>
                      handleArrayChange(i, e.target.value, setDescriptions)
                    }
                    required
                    className="mb-2"
                  />
                ))}
              </div>

              <div>
                <h2 className="font-semibold mb-2">Features</h2>
                {features.map((feat, i) => (
                  <Textarea
                    key={i}
                    placeholder={`Feature ${i + 1}`}
                    value={feat}
                    onChange={(e) =>
                      handleArrayChange(i, e.target.value, setFeatures)
                    }
                    required
                    className="mb-2"
                  />
                ))}
              </div>

              <Button type="submit" className="w-full">
                Save Product
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
