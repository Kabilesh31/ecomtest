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
  const [hideReviews, setHideReviews] = useState(false);
const [manualRatings, setManualRatings] = useState(false);
const [manualRatingValue, setManualRatingValue] = useState(0);
const [offerProduct, setOfferProduct] = useState(false);
const [offerPercentage, setOfferPercentage] = useState(0);
const [promoCodes, setPromoCodes] = useState<{ _id: string; code: string; title: string }[]>([]);
const [selectedPromo, setSelectedPromo] = useState<string>(""); // promo ID


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
        setHideReviews(data.hidereviews ?? false);
setManualRatings(data.manualRatings ?? false);
setManualRatingValue(data.manualRatingValue ?? 0);
setOfferProduct(data.offerProduct ?? false);
setOfferPercentage(data.offerPercentage ?? 0);
setSelectedPromo(data.promoApplied || "");
      } catch (error) {
        console.error("Failed to load product", error);
        toast.error("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

useEffect(() => {
  const fetchPromoCodes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promocode/`);
      const data = await res.json();

      if (res.ok && Array.isArray(data.data)) {
        const activePromos = data.data.filter((p: any) => p.isActive);
        setPromoCodes(activePromos);
      }
    } catch (err) {
      console.error("Failed to fetch promo codes", err);
    }
  };

  fetchPromoCodes();
}, []);





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
// ✔ Manual Rating Toggle Logic
const handleManualRatingToggle = () => {
  const newState = !manualRatings;
  setManualRatings(newState);

  if (newState === true) {
    // If manual rating ON → hide reviews must be ON
    setHideReviews(true);
  }
};

// ✔ Hide Reviews Toggle Logic
const handleHideReviewToggle = () => {
  const newState = !hideReviews;
  setHideReviews(newState);

  if (newState === false) {
    // If hide reviews OFF → manual rating must be OFF
    setManualRatings(false);
  }
};
const handleOfferToggle = () => {
  const newState = !offerProduct;
  setOfferProduct(newState);

  if (!newState) {
    setOfferPercentage(0);
  }
};
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
  formData.append("hidereviews", String(hideReviews));
  formData.append("manualRatings", String(manualRatings));
  formData.append("manualRatingValue", String(manualRatingValue));
  formData.append("offerProduct", String(offerProduct));
  formData.append("offerPercentage", String(offerPercentage));
  formData.append("promoApplied", selectedPromo || "");

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

    if (!res.ok) throw new Error(data.message || "Failed to update product");

    // 🔹 Update promo code association
    if (selectedPromo) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/promocode/apply-to-product`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoId: selectedPromo, productId: id }),
      });
    }

    toast.success("Product updated successfully!");
    router.push("/admin/products");
  } catch (err: any) {
    console.error(err);
    toast.error("❌ " + (err.message || "Something went wrong while updating."));
  }
};


  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading product...</p>;
type ToggleRowProps = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};
  const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, onToggle }) => {
  return (
    <div className="flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all">
      <p className="text-sm font-medium text-gray-800">{label}</p>

      <label className="relative inline-flex items-center cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="sr-only peer"
        />

        <div
          className="
            w-14 h-7 
            rounded-full 
            shadow-inner 
            transition-all 
            peer-checked:bg-green-500 
            bg-gray-300 
            relative
          "
        >
          <div
            className="
              absolute top-0.5 left-0.5 
              w-6 h-6 
              bg-white 
              rounded-full 
              shadow 
              transition-all duration-300 
              peer-checked:translate-x-7
            "
          ></div>
        </div>
      </label>
    </div>
  );
};



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
              <div>
  <label className="block text-sm font-medium mb-1">Apply Promo Code</label>
  <select
    value={selectedPromo}
    onChange={(e) => setSelectedPromo(e.target.value)}
    className="w-full border border-gray-300 rounded-md p-2 text-sm"
  >
    <option value="">No Promo</option>
    {promoCodes.map((promo) => (
      <option key={promo._id} value={promo._id}>
        {promo.title} ({promo.code})
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Select a promo code to apply for this product.
  </p>
</div>

              {/* ⚡ Review / Rating Toggles */}
{/* ⚡ Review / Rating Toggles */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">

  <ToggleRow
    label="Hide Reviews"
    checked={hideReviews}
    onToggle={handleHideReviewToggle}
  />

  <ToggleRow
    label="Manual Rating"
    checked={manualRatings}
    onToggle={handleManualRatingToggle}
  />

  {manualRatings && (
    <div className="col-span-2">
      <label className="block text-sm font-medium mb-1">Rating Value (0–5)</label>
      <Input
        type="number"
        min={0}
        max={5}
        value={manualRatingValue}
        onChange={(e) => setManualRatingValue(Number(e.target.value))}
        className="w-32"
      />
    </div>
  )}

</div>

{/* ⚡ Offer Section */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">

  <ToggleRow
    label="Offer Product"
    checked={offerProduct}
    onToggle={handleOfferToggle}
  />

  {offerProduct && (
    <div className="col-span-2">
      <label className="block text-sm font-medium mb-1">
        Offer Percentage (1–99)
      </label>

      <Input
        type="number"
        min={1}
        max={99}
        value={offerPercentage}
        onChange={(e) => setOfferPercentage(Number(e.target.value))}
        className="w-32"
        required={offerProduct}
      />
    </div>
  )}
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
