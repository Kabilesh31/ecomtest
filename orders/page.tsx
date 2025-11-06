"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card } from "@/components/ui/card"

export default function UserOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to login if user not logged in
  useEffect(() => {
    if (!user) {
      router.push("/account/login")
    }
  }, [user, router])

  const orders = [
    {
      id: "ORD-2001",
      product: "Wireless Headphones",
      amount: "₹2,499",
      status: "Delivered",
      date: "2025-11-05",
    },
    {
      id: "ORD-2002",
      product: "Smart Watch",
      amount: "₹4,199",
      status: "Pending",
      date: "2025-11-04",
    },
    {
      id: "ORD-2003",
      product: "Bluetooth Speaker",
      amount: "₹1,799",
      status: "Shipped",
      date: "2025-11-03",
    },
  ]

  if (!user) return null // prevent rendering before redirect

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">My Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4 flex items-center justify-between hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold">{order.product}</p>
                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                <p className="text-sm text-muted-foreground">Date: {order.date}</p>
              </div>

              <div className="text-right">
                <p className="font-medium">{order.amount}</p>
                <p
                  className={`text-sm font-semibold ${
                    order.status === "Delivered"
                      ? "text-green-600"
                      : order.status === "Pending"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {order.status}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-6">
          You have no orders yet.
        </p>
      )}
    </div>
  )
}
