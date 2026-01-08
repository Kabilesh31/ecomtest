"use client";

import { CartItem, useCart } from "@/context/cart-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CartItemsProps {
  items: CartItem[];
}

export function CartItems({ items }: CartItemsProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = (item: CartItem) => {
    if (item.quantity < (item.stock ?? Infinity)) {
      updateQuantity(item.id, item.quantity + 1);
    } else {
      toast.error("Requested quantity not available in stock");
    }
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  return (
    <>
      {items.map((item) => (
        <Card
          key={item.id}
          className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6"
        >
          <Link href={`/products/${item.id}`} className="flex-shrink-0">
            <img
              src={
                item?.mainImages?.[0] ? item.mainImages[0] : "/placeholder.svg"
              }
              alt={item.name}
              className="h-20 w-20 rounded-md object-cover"
            />
          </Link>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link
                href={`/products/${item.id}`}
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-lg">{item.name}</h3>
              </Link>
              <p className="text-sm text-muted-foreground mt-1">
                SKU: PROD-{item.id}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecrement(item)}
                  className="w-8 h-8 p-0 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleIncrement(item)}
                  className="w-8 h-8 p-0 flex items-center justify-center"
                   disabled={item.stock !== undefined && item.quantity >= item.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.price.toLocaleString("en-IN")} each
                </p>
                <p className="text-xs text-muted-foreground">
                  Available: {item.stock ?? "∞"}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeFromCart(item.id)}
            className="p-2 rounded-lg hover:bg-destructive/10"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </Card>
      ))}
    </>
  );
}
