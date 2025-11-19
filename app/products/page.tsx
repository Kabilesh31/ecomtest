"use client"

import { ClientLayout } from "@/components/client/client-layout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ShoppingCart, Heart, Badge, Star } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useCart, CartItem } from "@/context/cart-context"
import { toast } from "react-hot-toast"
import { ImageCarousel } from "@/components/client/ImageCarousel";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("featured")
  const [products, setProducts] = useState<any[]>([])
  const { items, addToCart, updateQuantity , removeFromCart} = useCart()
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [showPriceFilter, setShowPriceFilter] = useState(true)

  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products")
        setProducts(res.data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      }
    }
    fetchProducts()
  }, [])

  // ✅ Categories (later can be fetched)
  const categories = ["All", "Devine", "Accessories", "Cosmetics"]

  // ✅ Filtering
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory)

  // ✅ Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price
    if (sortBy === "price-high") return b.price - a.price
    return 0
  })
  const priceFilteredProducts = sortedProducts.filter((p) => {
  const finalPrice =
    p.offerProduct === true || p.offerProduct === "true"
      ? p.price - (p.price * p.offerPercentage) / 100
      : p.price;

  return finalPrice <= priceRange[1];
});

  return (
    <ClientLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-muted/50 py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              All Products
            </h1>
            <p className="text-muted-foreground">
              Explore our complete collection
            </p>
          </div>
        </div>

        {/* Filters + Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Product Grid */}
            <div className="lg:col-span-3">
            

              <div className="flex items-center justify-between mb-6">
                {/* <p className="text-sm text-muted-foreground">
                  Showing {filteredProducts.length} products
                </p> */}
                <div>
  

  {/* Toggle Button */}
  {/* <button
    onClick={() => setShowPriceFilter(!showPriceFilter)}
    className="w-35 px-3 py-2 bg-primary text-white rounded-lg text-sm"
  >
    {showPriceFilter ? "Hide Filter" : "Show Price Filter"}
  </button> */}

  {/* Collapsible Content */}
  {showPriceFilter && (
    <div className="px-1 mt-4">
      <input
        type="range"
        min={0}
        max={2000}
        step={500}
        value={priceRange[1]}
        onChange={(e) =>
          setPriceRange([0, Number(e.target.value)])
        }
        className="w-full accent-primary h-[3px]"
      />

      {/* Price Steps Visual  */}
      <div className="flex justify-between text-xs mt-1 text-muted-foreground">
        <span>0</span>
        
        <span>1000</span>
        
        <span>2000</span>
      </div>

      {/* Live selection  */}
      <div className="flex justify-between text-sm mt-2 text-muted-foreground">
        <span>Max:</span>
        <span className="font-semibold">₹{priceRange[1]}</span>
      </div>
    </div>
  )}
</div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* ✅ Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
               {priceFilteredProducts.map((product) => {
                  const cartItem = items.find(
                    (i: CartItem) =>
                      i.id === product._id || i.id === product.id
                  )
                  const quantityInCart = cartItem?.quantity || 0

                  const handleAdd = (e: React.MouseEvent) => {
                    e.preventDefault()
                    if (quantityInCart >= product.quantity) {
                      toast.error("Not enough stock available")
                      return
                    }

                    const finalPrice =
                      product.offerProduct === true || product.offerProduct === "true"
                        ? Number(
                            (product.price - (product.price * product.offerPercentage) / 100).toFixed(0)
                          )
                        : product.price;

                    addToCart({
                      id: product._id,
                      name: product.name,
                      price: finalPrice,
                      mainImages: product.mainImages?.[0] || "/placeholder.svg",
                       
                    });
                  }

                  const handleIncrease = (e: React.MouseEvent) => {
                    e.preventDefault()
                    if (quantityInCart >= product.quantity) {
                      toast.error("No more stock available")
                      return
                    }

                    const finalPrice =
                      product.offerProduct === true || product.offerProduct === "true"
                        ? Number(
                            (product.price - (product.price * product.offerPercentage) / 100).toFixed(0)
                          )
                        : product.price;

                    addToCart({
                      id: product._id,
                      name: product.name,
                      price: finalPrice,
                      mainImages: product.mainImages?.[0] || "/placeholder.svg", 
                    });
                  }

                  const handleDecrease = (e: React.MouseEvent) => {
                    e.preventDefault()
                    if (quantityInCart > 0) {
                      updateQuantity(product._id, quantityInCart - 1)
                    }
                  }

                  return (
                    <Link
                      key={product._id || product.id}
                      href={`/products/${product._id || product.id}`}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                        {/* Image */}
                  <div className="relative h-48 bg-muted overflow-hidden group">
                    <div className="relative h-48 bg-muted overflow-hidden group">
                      {product.mainImages && product.mainImages.length > 0 ? (
                        <ImageCarousel images={product.mainImages} />
                      ) : (
                        <img
                          src="/placeholder.svg"
                          alt="placeholder"
                          className="w-full h-full object-contain flex-shrink-0 snap-center"
                        />
                      )}

                      {product.quantity <= 5 && (
                        <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
                          {product.quantity} left
                        </div>
                      )}
                    </div>


                    {/* Left & Right overlay gradient for better visual look */}
                    <div className="absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white/80 to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white/80 to-transparent pointer-events-none" />

                    {/* Optional low stock badge */}
                    {product.quantity <= 5 && (
                      <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
                        {product.quantity} left
                      </div>
                    )}
                  </div>


                        {/* Info */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              {product.category || "General"}
                            </p>
                            <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                              {product.name}
                            </h3>
                            
                              {product.rating ? (
                                <div className="flex items-center gap-1">
                                  <Button className="flex items-center gap-1">
                                  {product.rating}
                                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-black text-sm">No Ratings</span>
                              )}
                              
                            
                          </div>
                          
                          {/* Price & Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
                            <div className="flex flex-col">
                              {product.offerProduct === true || product.offerProduct === "true" ? (
                                <div className="flex items-center gap-2">
                                  {/* 🔽 Discounted Price */}
                                  <span className="text-green-600 font-semibold text-lg">
                                    ₹{(product.price - (product.price * product.offerPercentage) / 100).toFixed(0)}
                                  </span>

                                  {/* 🔽 Original Price */}
                                  <span className="text-gray-400 line-through text-sm">
                                    ₹{product.price?.toLocaleString("en-IN")}
                                  </span>

                                  {/* 🔽 Offer Badge */}
                                  <span className="text-red-500 text-xs font-medium bg-red-100 px-2 py-0.5 rounded-full">
                                    {product.offerPercentage}% OFF
                                  </span>
                                </div>
                              ) : (
                                // No Offer — Normal Price
                                <span className="text-lg font-bold text-foreground">
                                  ₹{product.price?.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>

                            {/* ✅ Quantity Control */}
                            {/* ✅ Quantity Control */}
{quantityInCart === 0 ? (
  <Button
    size="sm"
    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
    onClick={(e) => {
      e.preventDefault();
      if (product.quantity > 0) {
        const finalPrice =
          product.offerProduct === true || product.offerProduct === "true"
            ? Number((product.price - (product.price * product.offerPercentage) / 100).toFixed(0))
            : product.price;

        addToCart({
          id: product._id,
          name: product.name,
          price: finalPrice,
          mainImages: product.mainImages?.[0] || "/placeholder.svg",
          stock: product.quantity, // ✅ important!
        });
      } else {
        toast.error("Out of stock!");
      }
    }}
  >
    <ShoppingCart className="w-4 h-4" />
    <span className="hidden sm:inline">Add</span>
  </Button>
) : (
  <div className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
    <Button
      size="sm"
      variant="ghost"
      className="w-6 h-6 p-0 text-lg"
      onClick={(e) => {
        e.preventDefault();
        if (quantityInCart > 1) {
          updateQuantity(product._id, quantityInCart - 1);
        } else {
          removeFromCart(product._id);
        }
      }}
    >
      −
    </Button>
    <span className="w-6 text-center text-sm font-medium">{quantityInCart}</span>
    <Button
      size="sm"
      variant="ghost"
      className="w-6 h-6 p-0 text-lg"
      onClick={(e) => {
        e.preventDefault();
        if (quantityInCart < product.quantity) {
          updateQuantity(product._id, quantityInCart + 1);
        } else {
          toast.error("No more stock available!");
        }
      }}
    >
      +
    </Button>
  </div>
)}

                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
