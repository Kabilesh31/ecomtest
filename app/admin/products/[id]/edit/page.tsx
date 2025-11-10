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

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>("");

  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  const categories = ["Devine", "Cosmetics", "Accessories"];

  // 🟢 Fetch product by ID
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
        setMainImageUrl(data.mainImage || "");
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Product updated successfully!");
        router.push("/admin/products");
      } else {
        toast.error("❌ " + (data.message || "Failed to update product."));
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong while updating.");
    }
  };

  const FileButton = ({
    label,
    file,
    onChange,
  }: {
    label: string;
    file: File | null;
    onChange: (file: File) => void;
  }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const handleClick = () => inputRef.current?.click();

    return (
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={handleClick}>
          {label}
        </Button>
        <span className="text-sm text-gray-600">
          {file ? file.name : "No file chosen"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) onChange(selected);
          }}
        />
      </div>
    );
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
  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-900 rounded-md hover:bg-white-50 hover:text-white-700 transition-all duration-200"
>
  ← Back
</button>

            <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 🧩 Basic Info */}
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

              {/* 🧩 Main Image */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Main Image
                </label>
                {mainImageUrl && !mainImage && (
                  <div className="flex items-center gap-4 mb-2">
                  <img
                    src={mainImageUrl}
                    alt="Current"
                    className="w-32 h-32 object-cover rounded mb-2 border"
                  />
                   <div className="text-sm text-gray-600">
        <p>
  <span className="font-medium">Product Added:</span>{" "}
  {product.createdAt
    ? new Date(product.createdAt).toLocaleDateString()
    : "N/A"}
</p>

      </div>
      </div>
                )}
                <FileButton
                  label="Choose New Main Image"
                  file={mainImage}
                  onChange={(file) => setMainImage(file)}
                />
              </div>

              {/* 🧩 Descriptions */}
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
                    onChange={(e) =>
                      handleArrayChange(i, e.target.value, setFeatures)
                    }
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
