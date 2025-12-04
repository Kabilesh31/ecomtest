"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Product } from "@/types/product"
import { useRef, useState,useEffect } from "react"
import { ClientHeader } from "@/components/client/client-header"
import { Lora } from "next/font/google"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Review } from "@/types/product";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
interface Props {
  product: Product
}

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

export default function ProductDetails({ product }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [merged, setMerged] = useState(false)
  const [quantity, setQuantity] = useState<number>(1)
    const { items, addToCart, removeFromCart,updateQuantity  } = useCart();
    const [showQuantity, setShowQuantity] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const effectRan = useRef(false);
    const { user } = useAuth();
    const hasUpdatedClick = useRef(false);
    
    
    

  const maxStock = product.quantity || 10; // fallback to 10 if undefined

  const isOut = product.outofstock === true || Number(product.quantity) === 0;

  // Find if product already in cart
  const existingItem = items.find((i) => i.id === (product._id || product.id));
  const currentQty = existingItem ? existingItem.quantity : 0;

  const { id } = useParams();

  
  // --- Scroll Animations ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const scale = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [1.3, 1.2, 1, 1.6])
  const x = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 0, 300, 0])
  const rotate = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 0, -25, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.33], [1, 1, 1])
  const textOpacity = useTransform(scrollYProgress, [0, 0.1, 0.1, 0.1], [1, 0.1, 0.1, 0.1])
  const textScale = useTransform(scrollYProgress, [0, 0.5], [2, 2])

  // --- Fixed images ---
  const featureImages = ["/coin1.png", "/coin2.png", "/creame.png", "/coin4.png"]
  const descriptionImages = ["/coin1.png", "/coin2.png", "/creame.png", "/coin4.png"]

   const mainImage = product.mainImages?.[0] || "/placeholder.jpg"


useEffect(() => {
  // ❌ Do NOT count for admin
  if (user?.role === "admin") {
    console.log("Admin detected → no click update");
    return;
  }

  // ❌ Prevent double execution
  if (hasUpdatedClick.current) return;

  if (!product?._id) return;

  const updateClick = async () => {
    try {
      await axios.put(`http://localhost:5000/api/products/click/${product._id}`);
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
      .get(`http://localhost:5000/api/products`)
      .then((res) => {
        const allProducts = res.data;

        const related = allProducts.filter((item: Product) =>
          item.category === product.category && item._id !== product._id
        );

        setRelatedProducts(related);
      })
      .catch((err) => console.log(err));
  }
}, [product]);


  // --- Cart functions ---
  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  
  const productId = product._id || product.id || "";
  const existingQty = existingItem ? existingItem.quantity : 0;

  if (existingQty + 1 > maxStock) {
    toast.error("No more stock available!");
    return;
  }

  addToCart(
    {
      id: productId,
      name: product.name,
      price: product.price,
      mainImages: [mainImage] // ✅ correct property
    } // quantity to add
  );

  setShowQuantity(true);
  toast.success("Added to cart!");
};


const handleDecrease = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
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
;

const handleBuyNowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  if (!existingItem) {
    addToCart({
      id: product._id || product.id || "",
      name: product.name,
      price: product.price,
      mainImages: [mainImage]
    });
  }

  router.push("/cart"); // Navigate immediately
};
const images = product.mainImages ?? [];

const nextImage = () => {
  if (images.length === 0) return;
  setCurrentImage((prev) =>
    prev === images.length - 1 ? 0 : prev + 1
  );
};

const prevImage = () => {
  if (images.length === 0) return;
  setCurrentImage((prev) =>
    prev === 0 ? images.length - 1 : prev - 1
  );
};
  return (
    <>
    <div className="hidden md:block">
    <div ref={containerRef} className="relative bg-black min-h-[400vh]">
      <ClientHeader />

      {/* --- Landing Animation --- */}
      {!merged && (
        <motion.div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none flex flex-col items-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          onAnimationComplete={() => setMerged(true)}
        >
          <motion.img
            src={mainImage}
            alt={product.name}
            className="w-40 md:w-56 object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* --- Floating Product --- */}
      {merged && (
        <motion.div
          className="fixed top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          style={{ scale, x, rotate, opacity }}
        >
          <motion.img
            src={mainImage}
            alt={product.name}
            className="w-40 md:w-56 object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* --- SECTION 1: FEATURES --- */}
      <div
        className="relative h-[200vh] w-full"
        style={{
          backgroundImage: "url(/bg1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

{product.features && (
  <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 grid grid-cols-1 md:grid-cols-2 gap-18 px-5 md:px-10 z-20">
    {/* Left column (first 2 features) */}
    <div className="flex flex-col gap-28">
      {product.features.slice(0, 2).map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="flex items-center gap-4 md:gap-6"
        >
          <img
            src={featureImages[index] || "/placeholder.jpg"}
            alt={typeof feature === "string" ? feature : feature.title}
            className="w-20 h-20 md:w-30 md:h-30 rounded-full object-cover shadow-lg flex-shrink-0"
          />
          <p
            className="bg-black/60 px-6 py-4 md:py-6 rounded-xl text-white 
                       text-sm sm:text-base md:text-lg font-medium shadow-lg 
                       w-fit text-center leading-relaxed break-words whitespace-pre-wrap"
            style={{ maxWidth: "28ch" }}
          >
            {typeof feature === "string" ? feature : feature.title}
          </p>
        </motion.div>
      ))}
    </div>

    {/* Right column (next 2 features) */}
    <div className="flex flex-col gap-28 items-end">
      {product.features.slice(2, 4).map((feature, index) => (
        <motion.div
          key={index + 2}
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="flex items-center gap-4 md:gap-6 flex-row-reverse"
        >
          <img
            src={featureImages[index + 2] || "/placeholder.jpg"}
            alt={typeof feature === "string" ? feature : feature.title}
            className="w-20 h-20 md:w-30 md:h-30 rounded-full object-cover shadow-lg flex-shrink-0"
          />
          <p
            className="bg-black/60 px-6 py-4 md:py-6 rounded-xl text-white 
                       text-sm sm:text-base md:text-lg font-medium shadow-lg 
                       w-fit text-center leading-relaxed break-words whitespace-pre-wrap"
            style={{ maxWidth: "28ch" }}
          >
            {typeof feature === "string" ? feature : feature.title}
          </p>
        </motion.div>
      ))}
    </div>
  </div>
)}



        {/* Center text */}
        <motion.div
          className={`fixed top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-5xl md:text-8xl font-bold text-center pointer-events-none select-none ${lora.className}`}
          style={{
            opacity: textOpacity,
            scale: textScale,
            color: "#888887",
          }}
        >
          E-commerce
        </motion.div>
      </div>

      

<div
  className="relative h-[150vh] w-full bg-cover bg-center bg-fixed"
  style={{ backgroundImage: "url(/bg2.jpg)" }}
>
  <div className="absolute inset-0 bg-black/30" />

  {/* Side image */}
  <img
    src="/hand.png"
    alt="Side Image"
    className="absolute top-1/2 right-0 -translate-y-1/2 w-32 md:w-180 object-contain"
    style={{ top: "60%" }}
  />

  {/* Zig-zag layout for descriptions */}
  {product.descriptions && (
    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex flex-col gap-16 md:gap-20 z-10">
      {product.descriptions.slice(0, 4).map((desc, index) => {
        const isLeft = index % 2 === 0
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className={`flex items-center gap-4 md:gap-6 ${
              isLeft
                ? "justify-start pl-12 md:pl-20"
                : "justify-end pr-12 md:pr-[57%]" // ✅ move closer to center
            }`}
          >
            {/* Left side image */}
            {isLeft && (
              <img
                src={descriptionImages[index] || "/placeholder.jpg"}
                alt={`desc-${index}`}
                className="w-10 h-10 md:w-29 md:h-29 rounded-full object-cover shadow-lg"
              />
            )}

            {/* Description box */}
            <p
              className={`bg-black/60 px-6 py-4 md:py-6 rounded-xl text-white 
                         text-sm sm:text-base md:text-lg font-medium shadow-lg 
                         leading-relaxed break-words whitespace-pre-wrap 
                         ${isLeft ? "text-left" : "text-left"}`}
              style={{
                maxWidth: "34ch",
                lineHeight: "1.6",
                wordBreak: "break-word",
              }}
            >
              {desc}
            </p>

            {/* Right side image */}
            {!isLeft && (
              <img
                src={descriptionImages[index] || "/placeholder.jpg"}
                alt={`desc-${index}`}
                className="w-10 h-10 md:w-29 md:h-29 rounded-full object-cover shadow-lg"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )}
</div>


      {/* --- SECTION 3: BUY SECTION --- */}
     <div
  className="relative h-screen w-full"
  style={{
    backgroundImage: "url(/bg3.jpeg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
>
  <div className="absolute inset-0 bg-black/35" />

  {/* Product Name */}
  <div
    className={`absolute top-35 left-1/2 -translate-x-1/2 z-40 text-gray-200 text-3xl md:text-6xl font-bold text-center select-none ${lora.className}`}
  >
    {product.name}
  </div>

  {/* Right Side Buttons */}
  <div className="absolute top-1/2 right-40 -translate-y-1/3 flex flex-col items-end gap-5 z-50 text-white">

    {/* Add to Cart */}
    {!showQuantity && (
      <Button
        size="sm"
        disabled={isOut}
        className={`gap-3 px-10 py-6 text-lg ${
          isOut
            ? "px-8 py-6 bg-gray-600 hover:bg-gray-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300"
            : "bg-primary hover:bg-primary/90 text-primary-foreground"
        }`}
        onClick={(e) => {
          e.preventDefault();
          if (isOut) return;

          addToCart({
            id: product._id ?? "",
            name: product.name,
            price: product.price,
            mainImages: product.mainImages,
            stock: product.quantity,
          });

          setShowQuantity(true);
        }}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden sm:inline">
          {isOut ? "Not available" : "Add to Cart"}
        </span>
      </Button>
    )}

    {/* Quantity UI */}
    {showQuantity && (
      <div className="flex items-center gap-8 bg-black/60 px-6 py-4 rounded-2xl shadow-lg">
        <button
          onClick={handleDecrease}
          className="px-3 text-xl font-bold"
          disabled={currentQty <= 0}
        >
          −
        </button>
        <span className="px-4 text-lg font-medium">{currentQty}</span>
        <button
          onClick={handleAddToCartClick}
          className="px-3 text-xl font-bold"
          disabled={currentQty >= maxStock}
        >
          +
        </button>

        <p className="text-xl font-semibold">
          ₹{(product.price * currentQty).toFixed(2)}
        </p>
      </div>
    )}

    {/* Buy Now */}
    <Button
      size="lg"
      disabled={isOut}
      className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300"
      onClick={handleBuyNowClick}
    >
      <ShoppingCart className="w-5 h-5 mr-2" />
      Buy Now
    </Button>

  </div>

  {/* RELATED PRODUCTS — BOTTOM RIGHT */}

  {product.reviews && product.reviews.length > 0 && (
  <div className="absolute bottom-[50%] left-6 z-50 w-[300px] md:w-[480px] bg-black/40 backdrop-blur-lg 
                      border border-white/20 rounded-2xl p-5 shadow-xl">
    <h2 className="text-xl font-bold text-white mb-4">Customer Reviews</h2>

    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
      {product.reviews.map((review: Review, index: number) => (
        <div
          key={index}
          className="min-w-[180px] bg-white/10 backdrop-blur-md border border-white/10 
                        rounded-xl p-4 shadow-lg"
        >
          <h3 className="text-white font-semibold text-sm">
            {review.customerName || "Customer"}
          </h3>

          <p className="text-yellow-400 font-bold text-sm mt-1">
            ⭐ {review.rating}/5
          </p>

          <p className="text-gray-200 text-xs mt-2 line-clamp-3">
            {review.message}
          </p>

          {review.date && (
  <p className="text-gray-400 text-[10px] mt-2">
    {new Date(review.date).toLocaleDateString()}
  </p>
)}
        </div>
      ))}
    </div>
  </div>
)}

  {relatedProducts.length > 0 && (
    <div className="absolute bottom-6 left-6 z-50 w-[300px] md:w-[480px] bg-black/40 backdrop-blur-lg 
                    border border-white/20 rounded-2xl p-5 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Related Products</h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {relatedProducts.map((item) => (
          <div
            key={item._id}
            onClick={() => router.push(`/products/${item._id}`)}
            className="min-w-[130px] cursor-pointer p-3 bg-white/10 backdrop-blur-md 
                       border border-white/10 rounded-xl hover:shadow-lg hover:scale-105 
                       transition duration-300"
          >
            <img
              src={item.mainImages?.[0]}
              alt={item.name}
              className="w-full h-24 object-cover rounded-xl"
            />
            <h3 className="mt-2 font-semibold text-white text-sm">
              {item.name}
            </h3>
            <p className="text-red-400 font-semibold text-sm">
              ₹{item.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  )}

</div>

    </div>
    </div>
    
    {/* MOBILE VIEW */}
<div className="block md:hidden min-h-screen w-full bg-black relative text-white">
  {/* NAV */}
  <ClientHeader />
  <div className="absolute top-19 left-4 z-50 flex items-center gap-3">
    <Link href="/products" className="p-2 rounded-full bg-white/10 backdrop-blur-md">
    <ChevronLeft size={24} />
    </Link>
    <p className="text-sm font-medium opacity-90">Back</p>
    </div>

      {/* BG IMAGE FULL SCREEN */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/bg3.jpeg)" }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 pb-20">

        {/* PRODUCT IMAGE */}
    {product.mainImages && product.mainImages.length > 0 && (
      <div className="relative w-full flex justify-center pt-10">

        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full z-20"
        >
          ‹
        </button>

        <img
          src={product.mainImages[currentImage]}
          alt={product.name}
          className="w-56 h-56 object-contain drop-shadow-xl transition-all duration-300"
        />

        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full z-20"
        >
          ›
        </button>

      </div>
    )}


    <h1 className="text-center text-2xl font-bold mt-4">{product.name}</h1>
    

    <p className="text-center text-xl font-semibold mt-1">
      ₹{product.price}
    </p>


      <div className="flex flex-col items-center gap-3 px-5 mt-6">
        {!showQuantity ? (
          <Button
            className={`w-full text-lg rounded-xl py-4 ${
              isOut ? "bg-gray-600 text-white cursor-not-allowed" : "bg-blue-600 text-white"
            }`}
            disabled={isOut}
            onClick={(e) => {
              e.preventDefault();
              if (isOut) return;

              addToCart({
                id: product._id || product.id || "",
                name: product.name,
                price: product.price,
                mainImages: [mainImage],
                stock: product.quantity,
              });

              setShowQuantity(true);
              toast.success("Added to cart!");
            }}
          >
            {isOut ? "Not Available" : "Add to Cart"}
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-black/50 w-full px-6 py-3 rounded-xl">
            <button
              className="text-2xl font-bold"
              onClick={handleDecrease}
              disabled={currentQty <= 0}
            >
              −
            </button>

            <span className="text-lg font-semibold">{currentQty}</span>

            <button
              className="text-2xl font-bold"
              onClick={handleAddToCartClick}
              disabled={currentQty >= maxStock}
            >
              +
            </button>

            <p className="text-lg font-semibold">
              ₹{(product.price * currentQty).toFixed(2)}
            </p>
          </div>
        )}

        {/* BUY NOW */}
        <Button
          className={`w-full text-lg rounded-xl py-4 ${
            isOut ? "bg-gray-600 text-white cursor-not-allowed" : "bg-green-600 text-white"
          }`}
          disabled={isOut}
          onClick={handleBuyNowClick}
        >
          Buy Now
        </Button>
        
      </div>


    {/* DESCRIPTION SECTION */}
    <div className="px-5 mt-10">
      <h2 className="text-xl font-bold mb-4">Description</h2>

      {product.descriptions?.map((desc, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-black/50 p-4 rounded-xl mb-3 leading-relaxed text-sm"
        >
          {desc}
        </motion.p>
      ))}
    </div>

    {/* FEATURES SECTION */}
    <div className="px-5 mt-10 mb-10">
      <h2 className="text-xl font-bold mb-4">Features</h2>
          {product.features?.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-black/50 p-4 rounded-xl mb-3 leading-relaxed text-sm"
            >
              {typeof feature === "string" ? feature : feature.title}
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    </>
  )
}
