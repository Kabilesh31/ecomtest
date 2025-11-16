"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useCart, CartItem } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ImageCarousel } from "./ImageCarousel";


export function ProductShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [priceRange, setPriceRange] = useState([0, 2000]);
const [showPriceFilter, setShowPriceFilter] = useState(false);


  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // ✅ Filter + Sort logic
  const filteredProducts = products.filter((p) =>
    selectedCategory === "all" ? true : p.category === selectedCategory
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });
  const priceFilteredProducts = sortedProducts.filter((p) => {
  const finalPrice =
    p.offerProduct === true || p.offerProduct === "true"
      ? p.price - (p.price * p.offerPercentage) / 100
      : p.price;

  return finalPrice <= priceRange[1];
});

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Products</h2>
            <p className="text-muted-foreground mt-2">
              Scroll left to right to explore our collection
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="bg-transparent hidden sm:inline-flex">
              View All
            </Button>
          </Link>
        </div>

        <div className="relative group">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div className="lg:col-span-3">
            {/* Filter + Sort */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
              <div className="flex gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm"
                >
                  <option value="all">All Categories</option>
                  {[...new Set(products.map((p) => p.category))].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
  onClick={() => setShowPriceFilter(!showPriceFilter)}
  className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
>
  {showPriceFilter ? "Hide Filter" : "Filter by Price"}
</button>{showPriceFilter && (
  <div className="w-full mt-4">
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

    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
      <span>0</span>
      <span>500</span>
      <span>1000</span>
      <span>1500</span>
      <span>2000</span>
    </div>

    <div className="flex justify-between text-sm mt-2 text-muted-foreground">
      <span>Selected:</span>
      <span className="font-semibold">₹{priceRange[1]}</span>
    </div>
  </div>
)}


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
            </div>

            {/* Products */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
            >
              {sortedProducts.length === 0 ? (
                <p className="text-muted-foreground text-center w-full">
                  No products found.
                </p>
              ) : (
                priceFilteredProducts.map((product) => {
                  const cartItem = items.find((i: CartItem) => i.id === product._id);
                  const quantityInCart = cartItem ? cartItem.quantity : 0;

                  return (
                    <Card
                      key={product._id}
                      className="flex-shrink-0 w-72 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer snap-start"
                    >
                      <Link href={`/products/${product._id}`}>
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

                          {product.quantity <= 5 && (
                            <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
                              {product.quantity} left
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {product.category}
                          </p>
                          <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-lg font-bold text-foreground">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>

                          {quantityInCart > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (quantityInCart > 1) {
                                    updateQuantity(product._id, quantityInCart - 1);
                                  } else {
                                    removeFromCart(product._id);
                                  }
                                }}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-medium w-5 text-center">{quantityInCart}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (quantityInCart < product.quantity) {
                                    updateQuantity(product._id, quantityInCart + 1);
                                  } else {
                                    toast.error("No more stock available!");
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
  size="sm"
  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-3 px-4 py-2 text-sm"
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
        mainImages: product.mainImages,
        stock: product.quantity, // ✅ pass the stock here!
      });
    } else {
      toast.error("Out of stock!");
    }
  }}
>
  <ShoppingCart className="w-5 h-5" />
  <span className="hidden sm:inline">Add</span>
</Button>

                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
