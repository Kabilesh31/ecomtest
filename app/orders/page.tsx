"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const router = useRouter()

  const orders = [
    {
      id: "ORD-101",
      date: "2025-11-03",
      status: "Delivered",
      total: 2299,
      payment: "Paid",
    },
    {
      id: "ORD-102",
      date: "2025-11-05",
      status: "Shipped",
      total: 1499,
      payment: "Paid",
    },
    {
      id: "ORD-103",
      date: "2025-11-06",
      status: "Processing",
      total: 999,
      payment: "Pending",
    },
  ]

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="container mx-auto py-10">
        {/* Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1 -ml-10">
            My Orders
          </h1>
        </div>

        {/* Orders Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr className="text-gray-700">
                  <th className="px-6 py-3 font-semibold">Order ID</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                  <th className="px-6 py-3 font-semibold text-right">Total</th>
                  <th className="px-6 py-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{order.id}</td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {order.payment === "Paid" ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {orders.length === 0 && (
          <p className="text-center text-muted-foreground mt-6">
            You have no orders yet.
          </p>
        )}
      </div>
    </ProtectedRoute>
  )
}
