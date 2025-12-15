"use client";

import { useWishlist } from "@/context/wishlist-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ClientHeader } from "@/components/client/client-header";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

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
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mt-6 mb-6">My Wishlist</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-md transition"
              >
                <Link href={`/products/${item.id}`}>
                  <img
                    src={item.mainImages?.[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="h-40 w-full object-contain"
                  />
                  <h3 className="font-semibold mt-2">{item.name}</h3>
                  <p className="font-bold">₹{item.price}</p>
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 w-full"
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
