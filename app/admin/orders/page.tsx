"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, X } from "lucide-react"
import axios from "axios"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Order } from "@/types/order"

// ✅ Add these imports for modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export default function OrdersPage() {
  const { user } = useAuth();
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const viewOrderDetailsHandler = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeModal = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

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
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">Rs. {order.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.createdAt.slice(0, 10).split("-").reverse().join("-")}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => viewOrderDetailsHandler(order)}
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                      >
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

      <Dialog open={showOrderDetails} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl p-6 rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center justify-between">
            Order Details
            {/* <Button variant="ghost" size="sm" onClick={closeModal}>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </Button> */}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Detailed information about this order.
          </DialogDescription>
        </DialogHeader>

        {selectedOrder ? (
          <div className="space-y-6 pt-4">
            {/* Customer Info Card */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Customer Info Card */}
              <div className="rounded-xl border bg-white dark:bg-muted/20 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">
                  Customer Info
                </h3>
                <div className="space-y-2 text-sm leading-relaxed">
                  <p><span className="font-semibold text-foreground">Name:</span> {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</p>
                  <p><span className="font-semibold text-foreground">Email:</span> {selectedOrder.customerDetails.email}</p>
                  <p><span className="font-semibold text-foreground">Phone:</span> {selectedOrder.customerDetails.phone}</p>
                  <p><span className="font-semibold text-foreground">Address:</span> {selectedOrder.customerDetails.address}</p>
                </div>
              </div>

              {/* Order Info Card */}
              <div className="rounded-xl border bg-white dark:bg-muted/20 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 tracking-wide uppercase">
                  Order Info
                </h3>
                <div className="space-y-2 text-sm leading-relaxed">
                  <p>
                    <span className="font-semibold text-foreground">Payment ID:</span>{" "}
                    {selectedOrder.razorpayPaymentId}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Status:</span>{" "}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Date:</span>{" "}
                    {selectedOrder.createdAt.slice(0, 10).split("-").reverse().join("-")}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Total:</span>{" "}
                    <span className="text-base font-semibold text-green-700 dark:text-green-300">
                      ₹{selectedOrder.totalAmount}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 🛒 Purchased Products */}
            <div className="border rounded-lg overflow-hidden">
              <h3 className="font-semibold text-lg bg-muted px-4 py-2">Purchased Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/70 border-b border-border">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Product Name</th>
                      <th className="px-4 py-2 text-left font-medium">Qty</th>
                      <th className="px-4 py-2 text-left font-medium">Price</th>
                      <th className="px-4 py-2 text-left font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.purchasedProducts.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-muted/40">
                        <td className="px-4 py-2 font-medium">{product.name}</td>
                        <td className="px-4 py-2">{product.quantity}</td>
                        <td className="px-4 py-2">₹{product.price}</td>
                        <td className="px-4 py-2 font-semibold">₹{product.price * product.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-semibold">
                      <td colSpan={3} className="px-4 py-3 text-right">Grand Total</td>
                      <td className="px-4 py-3">₹{selectedOrder.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">No order selected.</p>
        )}

        <DialogFooter className="pt-4 border-t">
          {/* <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" /> Close
          </Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </AdminLayout>
  )
}
