"use client"

import { Card } from "@/components/ui/card"
import { Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useCart, CartItem } from "@/context/cart-context"

interface CartItemsProps {
  items: CartItem[]
}

export function CartItems({ items }: CartItemsProps) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <div className="space-y-4">
      {items.map((product) => (
        <Card key={product.id} className="p-4 md:p-6">
          <div className="flex gap-4 md:gap-6">
            {/* Product Image */}
            <Link href={`/products/${product.id}`} className="flex-shrink-0">
              <img
                src={product.mainImage || "/placeholder.svg"}
                alt={product.name}
                className="w-24 h-24 md:w-32 md:h-32 object-cover bg-gray-200 rounded-lg hover:opacity-80 transition-opacity"
              />
            </Link>

            {/* Product Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-semibold text-foreground text-lg">{product.name}</h3>
                </Link>
                <p className="text-muted-foreground text-sm mt-1">SKU: PROD-{product.id}</p>
                
              </div>
              

              {/* Quantity and Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Minus Button */}
                  <button
                    onClick={() => updateQuantity(product.id, Math.max(1, product.quantity - 1))}
                    className="w-8 h-8 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-foreground font-semibold w-8 text-center">{product.quantity}</span>

                  {/* Plus Button */}
                  <button
  onClick={() => updateQuantity(product.id, product.quantity + 1)}
  className="w-8 h-8 border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
>
  <Plus className="w-4 h-4" />
</button>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    ₹{(product.price * product.quantity).toLocaleString("en-IN")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ₹{product.price.toLocaleString("en-IN")} each
                  </p>
                </div>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFromCart(product.id)}
              className="flex-shrink-0 text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}
