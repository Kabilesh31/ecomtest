"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
interface ImageData {
  text: string;
  image: File | null;
  imageUrl?: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string>("");

  const [descriptions, setDescriptions] = useState<ImageData[]>([]);
  const [features, setFeatures] = useState<ImageData[]>([]);

  const categories = ["Devine", "Cosmetics", "Accessories"];

  // 🟢 Fetch product by ID
  useEffect(() => {
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
        });

        setMainImageUrl(data.mainImage || "");
        setDescriptions(
          data.descriptions?.map((desc: any) => ({
            text: desc.text,
            image: null,
            imageUrl: desc.image,
          })) || []
        );
        setFeatures(
          data.features?.map((feat: any) => ({
            text: feat.text,
            image: null,
            imageUrl: feat.image,
          })) || []
        );

        setLoading(false);
      } catch (error: any) {
        console.error("Failed to load product", error);
        toast.error(error.message || "Failed to load product");
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
    field: "text" | "image",
    value: string | File,
    setter: React.Dispatch<React.SetStateAction<ImageData[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      if (field === "text") updated[index].text = value as string;
      else updated[index].image = value as File;
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

  descriptions.forEach((desc, i) => {
    formData.append(`descriptions[${i}][text]`, desc.text);
    if (desc.image) formData.append("descriptionImages", desc.image);
    else if (desc.imageUrl)
      formData.append(`descriptions[${i}][imageUrl]`, desc.imageUrl);
  });

  features.forEach((feat, i) => {
    formData.append(`features[${i}][text]`, feat.text);
    if (feat.image) formData.append("featureImages", feat.image);
    else if (feat.imageUrl)
      formData.append(`features[${i}][imageUrl]`, feat.imageUrl);
  });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    // ✅ Only show toast AFTER a successful update
    if (res.ok) {
      toast.success("✅ Product updated successfully!");
      // Optional small delay to let toast show before redirect
      setTimeout(() => {
        router.push("/admin/products");
      }, 1000);
    } else {
      toast.error(`❌ Failed to update: ${data.message || "Unknown error"}`);
    }
  } catch (err: any) {
    console.error(err);
    toast.error("❌ Something went wrong while updating product.");
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

  if (loading) return <p className="text-center py-10">Loading product...</p>;

  return (
    <AdminLayout>
      <AdminHeader title="Add New Product" />
    <div className="max-w-4xl mx-auto py-10">
      <Card>
        <CardContent className="space-y-8">
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
                <label className="block text-sm font-medium mb-1">Category</label>
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
              <label className="block text-sm font-medium mb-1">Main Image</label>
              {mainImageUrl && !mainImage && (
                <img
                  src={mainImageUrl}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded mb-2 border"
                />
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
                <div
                  key={i}
                  className="space-y-2 mb-4 border p-3 rounded-md bg-gray-50"
                >
                  <Textarea
                    placeholder={`Description ${i + 1}`}
                    value={desc.text}
                    onChange={(e) =>
                      handleArrayChange(i, "text", e.target.value, setDescriptions)
                    }
                  />
                  {desc.imageUrl && !desc.image && (
                    <img
                      src={desc.imageUrl}
                      alt={`Desc ${i + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  )}
                  <FileButton
                    label="Replace Image"
                    file={desc.image}
                    onChange={(file) =>
                      handleArrayChange(i, "image", file, setDescriptions)
                    }
                  />
                </div>
              ))}
            </div>

            {/* 🧩 Features */}
            <div>
              <h2 className="font-semibold mb-2">Features</h2>
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="space-y-2 mb-4 border p-3 rounded-md bg-gray-50"
                >
                  <Textarea
                    placeholder={`Feature ${i + 1}`}
                    value={feat.text}
                    onChange={(e) =>
                      handleArrayChange(i, "text", e.target.value, setFeatures)
                    }
                  />
                  {feat.imageUrl && !feat.image && (
                    <img
                      src={feat.imageUrl}
                      alt={`Feature ${i + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  )}
                  <FileButton
                    label="Replace Image"
                    file={feat.image}
                    onChange={(file) =>
                      handleArrayChange(i, "image", file, setFeatures)
                    }
                  />
                </div>
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
