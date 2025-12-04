"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Product, Review } from "@/types/product"
import { useRef, useState, useEffect } from "react"
import { ClientHeader } from "@/components/client/client-header"
import { Lora } from "next/font/google"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart,ShieldCheck, Truck, Sprout, Wallet } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"

interface Props {
  product: Product
}

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})
const monthCodes = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

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
  const router = useRouter()
  const { items, addToCart, removeFromCart, updateQuantity } = useCart()
  const { user } = useAuth()
  const { id } = useParams()
  const hasUpdatedClick = useRef(false)

  const [selectedImage, setSelectedImage] = useState(product.mainImages?.[0] || "/placeholder.jpg")
  const [showQuantity, setShowQuantity] = useState(false)
    const [promoCode, setPromoCode] = useState("");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  const existingItem = items.find((i) => i.id === (product._id || product.id))
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const currentQty = existingItem ? existingItem.quantity : 0
  const maxStock = product.quantity || 10
  const isOut = product.outofstock === true || Number(product.quantity) === 0
// At the top of your component
const featureImages = [
  "/coin1.png",
  "/coin2.png",
  "/clay.png",
  "/cup.png",
  // add as many as needed
];

const descriptionImages = [
  "/cones.png",
  "/cup2.png",
  "/sambrani.png",
  "/coin1.png",
  // add as many as needed
];

  // --- Update click count once per product ---
  useEffect(() => {
    if (user?.role === "admin") return
    if (hasUpdatedClick.current || !product?._id) return

    const updateClick = async () => {
      try {
        await axios.put(`http://localhost:5000/api/products/click/${product._id}`)
        console.log("Click count updated:", product._id)
      } catch (error) {
        console.error("Click update failed:", error)
      }
    }
    updateClick()
    hasUpdatedClick.current = true
  }, [product?._id, user?.role])

  // --- Fetch related products ---
  useEffect(() => {
    if (product?.category) {
      axios
        .get(`http://localhost:5000/api/products`)
        .then((res) => {
          const allProducts = res.data
          const related = allProducts.filter(
            (item: Product) => item.category === product.category && item._id !== product._id
          )
          setRelatedProducts(related)
        })
        .catch((err) => console.log(err))
    }
  }, [product])
  useEffect(() => {
    const today = new Date();
    const month = monthCodes[today.getMonth()];
    const year = today.getFullYear();
    setPromoCode(`${month}${year}`);
  }, []);
  // --- Cart Handlers ---
  const handleAddToCartClick = () => {
    if (currentQty + 1 > maxStock) {
      toast.error("No more stock available!")
      return
    }
    addToCart({
      id: product._id || product.id || "",
      name: product.name,
      price: product.price,
      mainImages: [selectedImage],
    })
    setShowQuantity(true)
    toast.success("Added to cart!")
  }
// 🟢 Save viewed products (recent history)
useEffect(() => {
  if (!product?._id) return;

  const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

  // remove if already exists (to avoid duplicates)
  const filtered = viewed.filter((p: any) => p._id !== product._id);

  // add product at first position
  const updated = [{ _id: product._id, name: product.name, price: product.price, image: product.mainImages?.[0] }, ...filtered];

  // limit to last 8 viewed items
  localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 8)));
}, [product]);
useEffect(() => {
  const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
  setRecentlyViewed(viewed.filter((p: any) => p._id !== product._id)); // avoid showing current product
}, [product]);

  const handleDecrease = () => {
    if (!existingItem) return
    if (existingItem.quantity > 1) {
      updateQuantity(existingItem.id, existingItem.quantity - 1)
      toast("Quantity decreased")
    } else {
      removeFromCart(existingItem.id)
      setShowQuantity(false)
      toast("Item removed from cart")
    }
  }

  const handleBuyNow = () => {
    if (!existingItem) {
      addToCart({
        id: product._id || product.id || "",
        name: product.name,
        price: product.price,
        mainImages: [selectedImage],
      })
    }
    router.push("/cart")
  }

  return (
    <div className="min-h-screen text-black" style={{ backgroundColor: "#fcfaf8" }}>
      <ClientHeader />

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT IMAGE + THUMBNAILS */}
        <div>
          <div className="w-full h-[420px] md:h-[470px] bg-[#f7f3ef] rounded-xl shadow-2xl flex items-center justify-center overflow-hidden">
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
      <h2 className="text-2xl font-bold text-gray-600 mb-6">Description</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {product.descriptions.map((desc, index) => (
          <div key={index} className="flex gap-4 items-start bg-black/10 p-4 rounded-xl shadow-lg">
            <img
              src={descriptionImages[index] || "/placeholder.jpg"}
              alt={`desc-${index}`}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-md mt-1"
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
      const discountedPrice = Math.round(product.price - (product.price * offer / 100)); // 👈 rounded
      const savings = Math.round(product.price * offer / 100); // 👈 rounded
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
            <span className="text-gray-400 text-lg line-through">₹{product.price}</span>

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
    <span className="text-3xl font-extrabold text-amber-800">₹{product.price}</span>
  </div>
)}



          {/* OFFER */}
          

          {/* RATING */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-xl ${i < (product.rating || 0) ? "text-yellow-500" : "text-gray-300"}`}
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
                className={`px-6 py-3 text-lg ${isOut ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white"}`}
                disabled={isOut}
                onClick={handleAddToCartClick}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> {isOut ? "Not Available" : "Add to Cart"}
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
                <span className="ml-4 font-semibold">₹{(product.price * currentQty).toFixed(2)}</span>
              </div>
            )}
            <Button
              className={`px-6 py-3 text-lg ${isOut ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white"}`}
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
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
        {product.features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center gap-2 bg-white/25 p-4 rounded-xl shadow-lg">
            <img
              src={featureImages[index] || "/placeholder.jpg"}
              alt={typeof feature === "string" ? feature : feature.title}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md"
            />
            <p className="text-gray text-center text-sm md:text-base font-medium">
              {typeof feature === "string" ? feature : feature.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}

  <div className="mt-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-5 rounded-2xl shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🎉 Promo Code</h3>
        
      </div>

      <div className="flex items-center justify-between bg-white text-purple-800 rounded-xl px-4 py-3 font-bold text-xl tracking-wider shadow-sm">
        {promoCode}
        <button
          className="text-sm bg-purple-800 text-white px-3 py-1 rounded-md hover:bg-purple-900 transition"
          onClick={() => navigator.clipboard.writeText(promoCode)}
        >
          Copy
        </button>
      </div>

      <p className="text-sm text-purple-100">
        Apply this promo code at checkout to get special discount — valid only for this month!
      </p>
    </div>
<div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-5">
      {highlights.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 bg-white50 p-4 rounded-xl border border-white/10 hover:bg-black/10 transition shadow-md"
        >
          <div className="text-yellow-400">{item.icon}</div>
          <p className="text-black text-sm font-semibold">{item.title}</p>
          <p className="text-black/80 text-xs">{item.subtitle}</p>
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
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <h3 className="text-2xl font-bold mb-4">Reviews & Comments</h3>
     {/* REVIEWS SECTION */}
{product.reviews?.length ? (
  product.reviews.map((review: Review, index: number) => (
    <div
      key={index}
      className="min-w-[180px] bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg"
    >
      <h3 className="text-black font-semibold text-sm">
        {review.customerName || "Customer"}
      </h3>

      <p className="text-yellow-400 font-bold text-sm mt-1">
        ⭐ {review.rating}/5
      </p>

      <p className="text-gray-600 text-xs mt-2 line-clamp-3">
        {review.message}
      </p>

      {review.date && (
        <p className="text-gray-800 text-[10px] mt-2">
          {new Date(review.date).toLocaleDateString()}
        </p>
      )}
    </div>
  ))
) : (
  <p className="text-gray-600">No reviews yet</p>
)}
{recentlyViewed.length > 0 && (
  <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
    <h3 className="text-2xl font-bold mb-6">Recently Viewed</h3>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {recentlyViewed.map((item: any, index: number) => (
        <div
          key={index}
          className="border rounded-lg p-3 cursor-pointer hover:shadow-2xl bg-black/15 transition"
          onClick={() => router.push(`/products/${item._id}`)}
        >
          <img
            src={item.image}
            className="h-32 w-full object-contain mb-2"
          />
          <p className="text-lg font-bold truncate">{item.name}</p>
          <p className="text-gray-800">₹{item.price}</p>
        </div>
      ))}
    </div>
  </div>
)}

      </div>
    </div>
  )
}
