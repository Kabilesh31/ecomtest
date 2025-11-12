"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useCart, CartItem } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

export function ProductShowcase() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

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

        {/* Horizontal Scroll Container */}
        <div className="relative group">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 " />
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

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory"
          >
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center w-full">
                No products found.
              </p>
            ) : (
              products.map((product) => {
                const cartItem = items.find((i: CartItem) => i.id === product._id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;

                return (
                  <Card
                    key={product._id}
                    className="flex-shrink-0 w-72 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer snap-start"
                  >
                    <Link href={`/products/${product._id}`}>
                      {/* Product Image */}
                     <div className="relative h-48 bg-muted overflow-hidden group">
  <div className="flex overflow-x-auto h-full scroll-smooth snap-x snap-mandatory">
    {product.mainImages && product.mainImages.length > 0 ? (
      product.mainImages.map((img: string, index: number) => (
        <img
          key={index}
          src={img}
          alt={`${product.name}-${index}`}
          className="w-full h-full object-contain flex-shrink-0 snap-center"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      ))
    ) : (
      <img
        src="/placeholder.svg"
        alt="placeholder"
        className="w-full h-full object-contain flex-shrink-0 snap-center"
      />
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

                    </Link>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          {product.category}
                        </p>
                        <h3 className="font-semibold text-foreground line-clamp-2 mt-1">
                          {product.name}
                        </h3>
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-lg font-bold text-foreground">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>

                        {/* ✅ Quantity Buttons or Add */}
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
                            <span className="font-medium w-5 text-center">
                              {quantityInCart}
                            </span>
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
                                addToCart({
                                  id: product._id,
                                  name: product.name,
                                  price: product.price,
                                  mainImage: product.mainImage,
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
    </section>
  );
}
