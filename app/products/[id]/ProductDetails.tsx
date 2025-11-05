"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Product } from "@/types/product"
import { useRef, useState } from "react"
import { ClientHeader } from "@/components/client/client-header"
import { Lora } from "next/font/google"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast";

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
    const { items, addToCart, removeFromCart } = useCart();
    const [showQuantity, setShowQuantity] = useState(false);
    
    

  const maxStock = product.quantity || 10; // fallback to 10 if undefined

  // Find if product already in cart
  const existingItem = items.find((i) => i.id === (product._id || product.id));
  const currentQty = existingItem ? existingItem.quantity : 0;

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

  // --- Cart functions ---
  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  if (currentQty >= maxStock) {
    toast.error("No more stock available!");
    return;
  }

  addToCart({
    id: product._id || product.id || "",
    name: product.name,
    price: product.price,
    mainImage: product.mainImage || "/placeholder.jpg",
  });

  setShowQuantity(true); // ✅ Show quantity selector
  toast.success("Added to cart!");
};

  const handleDecrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!existingItem) return;

    if (existingItem.quantity > 1) {
      removeFromCart(existingItem.id); // remove one unit (depends on your remove logic)
      toast("Quantity decreased");
    } else {
      toast("Item removed from cart");
      removeFromCart(existingItem.id);
    }
  };

const handleBuyNowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();

  if (!existingItem) {
    addToCart({
      id: product._id || product.id || "",
      name: product.name,
      price: product.price,
      mainImage: product.mainImage || "/placeholder.jpg",
    });
  }

  router.push("/cart"); // Navigate immediately
};

  return (
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
            src={product.mainImage || "/placeholder.jpg"}
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
            src={product.mainImage || "/placeholder.jpg"}
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

        <div
          className={`absolute top-35 left-1/2 -translate-x-1/2 z-40 text-gray-200 text-3xl md:text-6xl font-bold text-center select-none ${lora.className}`}
        >
          {product.name}
        </div>

        <div className="absolute top-1/2 right-50 -translate-y-1/2 flex flex-col items-end gap-5 z-50 text-white">
          {!showQuantity && (
  <Button
    size="lg"
    className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300"
    onClick={handleAddToCartClick}
  >
    <ShoppingCart className="w-5 h-5 mr-2" />
    Add cart
  </Button>
)}

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


          <Button
    size="lg"
    className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-full shadow-lg transition-all duration-300"
    onClick={handleBuyNowClick}
  >
    <ShoppingCart className="w-5 h-5 mr-2" />
    Buy Now
  </Button>
        </div>
      </div>
    </div>
  )
}
