"use client";

import { useWishlist } from "@/context/wishlist-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientHeader } from "@/components/client/client-header";
import { useEffect } from "react";
import axios from "axios";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const validateWishlist = async () => {
      for (const item of wishlist) {
        try {
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${item.id}`
          );
        } catch (err: any) {
          // Product deleted → remove from wishlist
          removeFromWishlist(item.id);
        }
      }
    };

    if (wishlist.length > 0) {
      validateWishlist();
    }
  }, [wishlist, removeFromWishlist]);

  return (
    <>
      <ClientHeader />

      {wishlist.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-xl font-semibold">Your wishlist is empty ❤️</h2>
          <Link href="/">
            <Button className="mt-4">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="max-w-xl md:max-w-6xl mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-bold mt-6 mb-6">
            My Wishlist
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition"
              >
                <Link href={`/products/${item.id}`}>
                  <img
                    src={item.mainImages?.[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="h-28 sm:h-40 w-full object-contain"
                  />
                  <h3 className="font-semibold text-sm sm:text-base mt-1 sm:mt-2">
                    {item.name}
                  </h3>
                  <p className="font-bold text-sm sm:text-base">
                    ₹{item.price}
                  </p>
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 sm:mt-3 w-full text-xs sm:text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(item.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
