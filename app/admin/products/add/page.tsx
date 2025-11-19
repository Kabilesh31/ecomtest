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
    offerProduct: "false", 
    offerPercentage: "",
    manualRatings: "false", 
    manualRatingValue: "", 
    outofstock: "false", 
    hidereviews: "false", 
  });

  const [mainImages, setMainImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState(["", "", ""]);
  const [features, setFeatures] = useState(["", "", "", ""]);

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

  // 🧩 Submit form with multiple images
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("price", product.price);
    formData.append("quantity", product.quantity);
    formData.append("category", product.category);
    formData.append("offerProduct", product.offerProduct);
    if (product.offerProduct === "true") {
      formData.append("offerPercentage", product.offerPercentage);
    }

    formData.append("manualRatings", product.manualRatings);
    if (product.manualRatings === "true") {
      formData.append("manualRatingValue", product.manualRatingValue);
    }

    formData.append("outofstock", product.outofstock);
    formData.append("hidereviews", product.hidereviews);

    // append all selected images
    mainImages.forEach((img) => formData.append("mainImages", img));

    formData.append("descriptions", JSON.stringify(descriptions));
    formData.append("features", JSON.stringify(features));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(" Product added successfully!");
        setProduct({
          name: "",
          price: "",
          quantity: "",
          category: "",
          offerProduct: "false",
          offerPercentage: "",
          manualRatings: "false",
          manualRatingValue: "",
          outofstock: "false",
          hidereviews: "false",
        });
        setMainImages([]);
        setPreviewUrls([]);
        setDescriptions(["", "", ""]);
        setFeatures(["", "", "", ""]);
      } else {
        toast.error(" Failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while adding product.");
    }
  };

  // 🧩 Add images handler
  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setMainImages((prev) => [...prev, ...fileArray]);

    const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
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
                  {/* <label className="block text-sm font-medium mb-1">
                    Category
                  </label> */}
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

         <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium mb-2">Have Offer?</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offerProduct"
                    value="true"
                    checked={product.offerProduct === "true"}
                    onChange={handleInputChange}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-800">Yes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="offerProduct"
                    value="false"
                    checked={product.offerProduct === "false"}
                    onChange={handleInputChange}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-800">No</span>
                </label>
              </div>
            </div>

            {product.offerProduct === "true" && (
              <div>
                <label className="block text-sm font-medium mb-2">Offer Percentage (%)</label>
                <Input
                  name="offerPercentage"
                  type="number"
                  value={product.offerPercentage}
                  onChange={handleInputChange}
                  placeholder="e.g. 10"
                  min={1}
                  max={100}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Enter a number between 1 and 100.</p>
              </div>
            )}
          </div>


          <div className="grid md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-2">Manual Ratings</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manualRatings"
                  value="true"
                  checked={product.manualRatings === "true"}
                  onChange={handleInputChange}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-800">Yes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="manualRatings"
                  value="false"
                  checked={product.manualRatings === "false"}
                  onChange={handleInputChange}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-800">No</span>
              </label>
            </div>
          </div>

          {product.manualRatings === "true" && (
            <div>
              <label className="block text-sm font-medium mb-2">Enter Your Rate</label>
              <Input
                name="manualRatingValue"
                type="number"
                value={product.manualRatingValue}
                onChange={handleInputChange}
                placeholder="e.g. 4.5"
                min={0}
                max={5}
                step={0.1}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Rating between 0 and 5.</p>
            </div>
          )}
        </div>


            <div className="grid md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium mb-2">Mark As Outofstock</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="outofstock"
                      value="true"
                      checked={product.outofstock === "true"}
                      onChange={handleInputChange}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-800">Yes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="outofstock"
                      value="false"
                      checked={product.outofstock === "false"}
                      onChange={handleInputChange}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-800">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hide Ratings & Reviews</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hidereviews"
                      value="true"
                      checked={product.hidereviews === "true"}
                      onChange={handleInputChange}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-800">Yes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hidereviews"
                      value="false"
                      checked={product.hidereviews === "false"}
                      onChange={handleInputChange}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-800">No</span>
                  </label>
                </div>
              </div>
            </div>

              {/* ✅ Multiple Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <span className="text-orange-600 text-2xl">*</span> Main Product Images
                </label>

                <div className="flex flex-wrap gap-3 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("mainImages")?.click()}
                  >
                    + Add More Images
                  </Button>
                  <input
                    id="mainImages"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files)}
                  />
                </div>

                {previewUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMainImages((prev) => prev.filter((_, idx) => idx !== i));
                            setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-1">
                  You can upload multiple transparent PNG images.
                </p>
                <p className="text-sm text-gray-400 ">
                  Total Image collection should not be more than 10mb.
                </p>
                <p className="text-sm text-gray-400 ">
                  First image should be a main image.
                </p>
              </div>

              {/* Descriptions */}
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

              {/* Features */}
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
