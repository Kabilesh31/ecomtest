"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import axios from "axios"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Order } from "@/types/order";

const mockOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    total: 899.99,
    status: "Delivered",
    date: "2025-01-15",
    items: 2,
  },
  {
    id: "ORD-002",
    customer: "Sarah Smith",
    email: "sarah@example.com",
    total: 299.99,
    status: "Processing",
    date: "2025-01-18",
    items: 1,
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    email: "mike@example.com",
    total: 1299.99,
    status: "Shipped",
    date: "2025-01-19",
    items: 3,
  },
]


export default function OrdersPage() {
  const {user} = useAuth();

  const [orderDatas, setOrderDatas] = useState<Order[]>([]);

  
  const getOrdersByAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/order", {
        params: { role: user?.role, userId: user?._id },
      });

      if (response.data.success) {
        setOrderDatas(response.data.data);
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

    useEffect(() => {
    if (user && orderDatas.length === 0) {
      getOrdersByAdmin();
    }
  }, [user, orderDatas]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
      case "Shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
      case "Processing":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
    }
  }     
  
  return (

    <AdminLayout>
        <div className="space-y-6">
          <AdminHeader title="Orders" description="Manage customer orders" />

<Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Payment ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
{/* <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Items</th> */}
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orderDatas.map((order) => (
                    <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{order.razorpayPaymentId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.customerDetails.firstName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerDetails.email}</p>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-muted-foreground">{order.items}</td> */}
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">Rs. {order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.createdAt.slice(0,10).split("-").reverse().join("-")}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
                          </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </Card>
        </div>
      </AdminLayout>

  )
}