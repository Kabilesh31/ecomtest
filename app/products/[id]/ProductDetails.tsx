"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Product, Review } from "@/types/product";
import { useRef, useState, useEffect } from "react";
import { ClientHeader } from "@/components/client/client-header";
import { Lora } from "next/font/google";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { PromoCode } from "@/types/promo";
import { ShoppingCart, ShieldCheck, Truck, Sprout, Wallet } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

interface Props {
  product: Product;
}

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});
const monthCodes = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const highlights = [
  {
    icon: <Truck size={32} />,
    title: "Free Shipping",
    subtitle: "above 1499",
  },
  {
    icon: <ShieldCheck size={32} />,
    title: "Secure",
    subtitle: "Payments",
  },
  {
    icon: <Sprout size={32} />,
    title: "Farmers",
    subtitle: "Empowerment",
  },
  {
    icon: <Wallet size={32} />,
    title: "COD",
    subtitle: "available",
  },
];



export default function ProductDetails({ product }: Props) {
  const router = useRouter();
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const { id } = useParams();
  const hasUpdatedClick = useRef(false);

  const [selectedImage, setSelectedImage] = useState(
    product.mainImages?.[0] || "/placeholder.jpg"
  );
  const [showQuantity, setShowQuantity] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
const [loading, setLoading] = useState(false);

  const existingItem = items.find((i) => i.id === (product._id || product.id));
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const currentQty = existingItem ? existingItem.quantity : 0;
  const maxStock = product.quantity || 10;
  const isOut = product.outofstock === true || Number(product.quantity) === 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  const offer = product.offerProduct ? product.offerPercentage ?? 0 : 0;

const finalPrice =
  offer > 0
    ? Math.round(product.price - (product.price * offer) / 100)
    : product.price;
  const INITIAL_REVIEWS = 4;
  const featureImages = ["/coin1.png", "/coin2.png", "/clay.png", "/cup.png"];

  const descriptionImages = [
    "/cones.png",
    "/cup2.png",
    "/sambrani.png",
    "/coin1.png",
  ];

  useEffect(() => {
    if (user?.role === "admin") return;
    if (hasUpdatedClick.current || !product?._id) return;

    const updateClick = async () => {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/products/click/${product._id}`
        );
        console.log("Click count updated:", product._id);
      } catch (error) {
        console.error("Click update failed:", error);
      }
    };
    updateClick();
    hasUpdatedClick.current = true;
  }, [product?._id, user?.role]);

  
  useEffect(() => {
    if (product?.category) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/products`)
        .then((res) => {
          const allProducts = res.data;
          const related = allProducts.filter(
            (item: Product) =>
              item.category === product.category && item._id !== product._id
          );
          setRelatedProducts(related);
        })
        .catch((err) => console.log(err));
    }
  }, [product]);
  useEffect(() => {
    const today = new Date();
    const month = monthCodes[today.getMonth()];
    const year = today.getFullYear();
    setPromoCode(`${month}${year}`);
  }, []);

  const handleAddToCartClick = () => {
    if (currentQty + 1 > maxStock) {
      toast.error("No more stock available!");
      return;
    }
    addToCart({
      id: product._id || product.id || "",
      name: product.name,
      price: finalPrice,
      mainImages: [selectedImage],
      stock: maxStock,
      
    });
    setShowQuantity(true);
    toast.success("Added to cart!");
  };
useEffect(() => {
  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/promocode/`
      );

      const promos: PromoCode[] = Array.isArray(res.data?.data)
        ? res.data.data.filter(
            (p: PromoCode) =>
              p.isActive && new Date(p.expiryDate) >= new Date()
          )
        : [];

      setPromoCodes(promos);
      setSelectedPromo(promos.length > 0 ? promos[0] : null);
    } catch {
      toast.error("Failed to fetch promo codes");
      setPromoCodes([]);
      setSelectedPromo(null);
    } finally {
      setLoading(false);
    }
  };

  fetchPromoCodes();
}, []);


  useEffect(() => {
    if (!product?._id) return;

    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

    const filtered = viewed.filter((p: any) => p._id !== product._id);

    const updated = [
      {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.mainImages?.[0],
      },
      ...filtered,
    ];

    localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 8)));
  }, [product]);
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setRecentlyViewed(viewed.filter((p: any) => p._id !== product._id));
  }, [product]);

  const handleDecrease = () => {
    if (!existingItem) return;
    if (existingItem.quantity > 1) {
      updateQuantity(existingItem.id, existingItem.quantity - 1);
      toast("Quantity decreased");
    } else {
      removeFromCart(existingItem.id);
      setShowQuantity(false);
      toast("Item removed from cart");
    }
  };

  const handleBuyNow = () => {
    if (!existingItem) {
      addToCart({
        id: product._id || product.id || "",
        name: product.name,
        price: finalPrice,
        mainImages: [selectedImage],
        stock: maxStock,
      });
    }
    router.push("/cart");
  };

  return (
    <div
      className="min-h-screen text-black"
      style={{ backgroundColor: "#fcfaf8" }}
    >
      <ClientHeader />

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* LEFT IMAGE + THUMBNAILS */}
        <div>
          <div className="w-full h-[420px] md:w-[450px] md:h-[350px] bg-[#e7e4e2] rounded-xl shadow-2xl flex items-center justify-center overflow-hidden">
            <img
              src={selectedImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="flex gap-3 mt-8 overflow-x-auto">
            {product.mainImages?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                onClick={() => setSelectedImage(img)}
                className={`h-20 w-20 rounded-lg object-cover cursor-pointer border ${
                  selectedImage === img ? "border-black" : "border-gray-400"
                }`}
              />
            ))}
          </div>

          {product.descriptions && product.descriptions.length > 0 && (
            <div className="mb-12 mt-18">
              <h2 className="text-2xl font-bold text-gray-600 mb-6">
                Description
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {product.descriptions.map((desc, index) => (
                  <div
  key={index}
  className="flex gap-4 items-center bg-black/10 p-4 rounded-xl shadow-lg"
>
  <img
    src={descriptionImages[index] || "/placeholder.jpg"}
    alt={`desc-${index}`}
    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-md"
  />
  <p className="text-black text-sm md:text-base leading-relaxed">
    {desc}
  </p>
</div>

                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SECTION: Price, Offer, Rating, Buttons */}
        <div className="flex flex-col justify-start gap-5">
          {/* PRICE */}
          {product.offerProduct ? (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
              {(() => {
                const offer = product.offerPercentage ?? 0; // fallback
                const discountedPrice = Math.round(
                  product.price - (product.price * offer) / 100
                ); // 👈 rounded
                const savings = Math.round((product.price * offer) / 100); // 👈 rounded
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold text-amber-800">
                        ₹{discountedPrice}
                      </span>

                      {offer > 0 && (
                        <span className="bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full animate-pulse">
                          🔥 {offer}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-400 text-lg line-through">
                        ₹{product.price}
                      </span>

                      {offer > 0 && (
                        <span className="text-emerald-700 font-semibold">
                          You Save ₹{savings}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-gray-600">
                      Special price available for a limited time.
                    </p>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="mt-6">
              <span className="text-3xl font-extrabold text-amber-800">
                ₹{product.price}
              </span>
            </div>
          )}

          {/* RATING */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-xl ${
                  i < (product.rating || 0)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
            <span className="ml-2 text-gray-600">{product.rating || 0}/5</span>
          </div>

          {/* ADD TO CART / BUY NOW */}
          <div className="flex items-center gap-4 mt-4">
            {!showQuantity ? (
              <Button
                className={`px-6 py-3 text-lg ${
                  isOut
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white"
                }`}
                disabled={isOut}
                onClick={handleAddToCartClick}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />{" "}
                {isOut ? "Not Available" : "Add to Cart"}
              </Button>
            ) : (
              <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-md">
                <button
                  className="px-3 text-xl font-bold"
                  onClick={handleDecrease}
                  disabled={currentQty <= 0}
                >
                  −
                </button>
                <span className="font-medium text-lg">{currentQty}</span>
                <button
                  className="px-3 text-xl font-bold"
                  onClick={handleAddToCartClick}
                  disabled={currentQty >= maxStock}
                >
                  +
                </button>
                <span className="ml-4 font-semibold">
  ₹{(finalPrice * currentQty).toFixed(2)}
</span>
              </div>
            )}
            <Button
              className={`px-6 py-3 text-lg ${
                isOut
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white"
              }`}
              disabled={isOut}
              onClick={handleBuyNow}
            >
              Buy Now
            </Button>
          </div>

          {/* --- FEATURES & DESCRIPTION SECTION --- */}
          <div className="relative z-10 max-w-7xl mx-auto px-5 mt-2">
            {/* FEATURES */}
            {product.features && product.features.length > 0 && (
              <div className="mb-18">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">
                  Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                  {product.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 bg-white/25 p-4 rounded-xl shadow-lg"
                    >
                      <img
                        src={featureImages[index] || "/placeholder.jpg"}
                        alt={
                          typeof feature === "string" ? feature : feature.title
                        }
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md"
                      />
                      <p className="text-gray justify-center text-sm md:text-base font-medium">
                        {typeof feature === "string" ? feature : feature.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

         <div className="mt-12 bg-gradient-to-r from-orange-50 to-yellow-50 text-gray-800 p-5 rounded-xl shadow-lg flex flex-col gap-3 border border-orange-200">
  <h3 className="text-lg font-semibold text-orange-800">
    🎉 Available Promo Codes
  </h3>

  {loading && (
    <p className="text-sm text-orange-600">
      Loading promo codes...
    </p>
  )}

  {!loading && promoCodes.length === 0 && (
    <p className="text-sm text-gray-600">
      No active promo codes available
    </p>
  )}

  {!loading && promoCodes.length > 0 && selectedPromo && (
    <>
      <select
        className="rounded-lg px-1 py-1 bg-white text-gray-700 font-medium outline-none border border-orange-30"
        value={selectedPromo._id}
        onChange={(e) => {
          const promo =
            promoCodes.find(p => p._id === e.target.value) || null;
          setSelectedPromo(promo);
        }}
      >
        {promoCodes.map((promo) => (
          <option key={promo._id} value={promo._id}>
            {promo.title} ({promo.code.toUpperCase()})
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between bg-white text-orange-700 rounded-lg px-4 py-3 font-bold text-xl tracking-wider shadow-sm border border-orange-100">
        {selectedPromo.code.toUpperCase()}
        <button
          className="text-sm bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition"
          onClick={() => navigator.clipboard.writeText(selectedPromo.code)}
        >
          Copy
        </button>
      </div>

      <div className="text-sm text-gray-700 ">
       
        <p>
          Discount:{" "}
          <span className="font-semibold">
            {selectedPromo.discountType === "percentage"
              ? `${selectedPromo.discountValue}%`
              : `₹${selectedPromo.discountValue}`}
          </span>
        </p>
        <p>
          Expires on:{" "}
          {new Date(selectedPromo.expiryDate).toLocaleDateString()}
        </p>
      </div>
    </>
  )}
</div>



            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
  {highlights.map((item, index) => (
    <div
      key={index}
      className="flex flex-col items-center gap-1.5
                 bg-white/50 p-2.5 rounded-lg
                 border border-white/10
                 hover:bg-black/10 transition shadow-sm"
    >
      <div className="text-yellow-400 text-lg">
        {item.icon}
      </div>

      <p className="text-black text-xs font-semibold text-center">
        {item.title}
      </p>

      <p className="text-black/80 text-[10px] text-center">
        {item.subtitle}
      </p>
    </div>
  ))}
</div>

          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {/* {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
          <h3 className="text-2xl font-bold mb-6">Related Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {relatedProducts.map((item) => (
              <div
                key={item._id}
                className="border rounded-lg p-3 cursor-pointer bg-black/15 hover:shadow-2xl transition"
                onClick={() => router.push(`/products/${item._id}`)}
              >
                <img
                  src={item.mainImages?.[0]}
                  className="h-30 w-full object-contain mb-2"
                />
                <p className=" text-lg font-bold truncate">{item.name}</p>
                <p className="text-gray-700">₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* REVIEWS & COMMENTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-6">
            <h3 className="text-2xl font-bold mb-6">Reviews & Comments</h3>

            <div className="space-y-4">
              {product.reviews
                .slice(0, showAll ? product.reviews.length : INITIAL_REVIEWS)
                .map((review: Review, index: number) => (
                  <div
                    key={index}
                    className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-black font-semibold text-sm">
                        {review.customerName || "Customer"}
                      </h3>

                      <p className="text-yellow-400 font-bold text-sm">
                        ⭐ {review.rating}/5
                      </p>
                    </div>

                    <p className="text-gray-600 text-sm mt-2">
                      {review.message}
                    </p>

                    {review.date && (
                      <p className="text-gray-800 text-xs mt-2">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {product.reviews.length > INITIAL_REVIEWS && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
              >
                {showAll ? "View Less" : "View More"}
              </button>
            )}
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-1 py-10 relative">
            <h3 className="text-2xl font-bold mb-6">Recently Viewed</h3>

            {/* Left Button */}
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100"
            >
              ◀
            </button>

            {/* Right Button */}
            <button
              onClick={() =>
                scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                 bg-white shadow-lg p-2 rounded-full hover:bg-gray-100"
            >
              ▶
            </button>

            {/* Scroll Area */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide px-8"
            >
              {recentlyViewed.map((item: any, index: number) => (
                <div
                  key={index}
                  onClick={() => router.push(`/products/${item._id}`)}
                  className="min-w-[160px] border rounded-lg p-2 cursor-pointer bg-black/15 hover:shadow-xl transition"
                >
                  <img
                    src={item.image}
                    className="h-24 w-full object-contain mb-2"
                  />

                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-gray-800 text-sm">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
