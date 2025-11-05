"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Share2, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  inStock: boolean
  category: string
  image?: string
}

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCart()

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "/placeholder.svg",
      })
    }
    setQuantity(1)
  }

  return (
    <div className="space-y-6">
      {/* Category and Title */}
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.category}</p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
      </div>

      {/* Rating */}
      {/* <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-muted-foreground"}>
                ★
              </span>
            ))}
          </div>
          <span className="font-semibold text-foreground">{product.rating}</span>
        </div>
        <span className="text-muted-foreground">({product.reviews} reviews)</span>
      </div> */}

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-semibold">
                -{discount}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${product.inStock ? "bg-green-500" : "bg-destructive"}`}></div>
        <span className={`font-medium ${product.inStock ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Quantity</label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          >
            −
          </button>
          <span className="text-lg font-semibold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <Button
          disabled={!product.inStock}
          onClick={handleAddToCart}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </Button>

        <Button variant="outline" className="w-full bg-transparent py-6 text-lg font-semibold">
          Buy Now
        </Button>
      </div>

      {/* Wishlist and Share */}
      {/* <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          onClick={() => setIsWishlisted(!isWishlisted)}
          variant="outline"
          className={`flex-1 bg-transparent gap-2 ${isWishlisted ? "text-destructive border-destructive" : ""}`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          Wishlist
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent gap-2">
          <Share2 className="w-5 h-5" />
          Share
        </Button>
      </div> */}

      {/* Delivery Info */}
      {/* <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Delivery Information</p>
        <p className="text-sm text-muted-foreground">Estimated delivery: 3-5 business days</p>
        <p className="text-sm text-muted-foreground">Free shipping on orders over ₹2500</p>
      </div> */}
    </div>
  )
}
