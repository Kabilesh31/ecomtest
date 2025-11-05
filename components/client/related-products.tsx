import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"

interface RelatedProductsProps {
  currentProductId: number
}

// Mock related products
const relatedProducts = [
  {
    id: 2,
    name: "Luxury Watch",
    price: 599.99,
    rating: 4.9,
    image: "/luxury-watch.jpg",
  },
  {
    id: 3,
    name: "Designer Sunglasses",
    price: 199.99,
    rating: 4.7,
    image: "/designer-sunglasses.png",
  },
  {
    id: 4,
    name: "Premium Wireless Headphones",
    price: 299.99,
    rating: 4.8,
    image: "/wireless-headphones.png",
  },
]

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  return (
    <div className="py-8 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="relative h-48 bg-muted overflow-hidden group">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground line-clamp-2">{product.name}</h3>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                  <span className="text-yellow-400">★</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-lg font-bold text-foreground">${product.price}</span>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
