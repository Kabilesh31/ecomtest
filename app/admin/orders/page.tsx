"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AdminHeader } from "@/components/admin/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Order } from "@/types/order";
import { motion } from "framer-motion";
import { MoreHorizontal, Check,Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function OrdersPage() {
  const { user } = useAuth();
  const [showOrderDetails, setShowOrderDetails] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDatas, setOrderDatas] = useState<Order[]>([]);
 const [statusFilter, setStatusFilter] = useState<
  "All" | "Pending" | "Delivered" | "Return Initiated"
>("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        const products = Array.isArray(res.data) ? res.data : res.data.data;
        setAllProducts(products || []);
        console.log("Loaded products:", products);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  useEffect(() => {
    if (user) getOrdersByAdmin();
  }, [user]);

  // Helper to normalize status for filtering
 const getFilterStatus = (
  status: string
): "Pending" | "Delivered" | "Return Initiated" | "Other" => {
  const normalized = status.toLowerCase().trim();

  if (normalized === "order recieved" || normalized === "pending")
    return "Pending";

  if (normalized === "completed" || normalized === "delivered")
    return "Delivered";

  if (normalized === "return initiated")
    return "Return Initiated";

  return "Other";
};


 const getStatusColor = (status: string) => {
  const normalized = status.toLowerCase().trim();

  switch (normalized) {
    case "completed":
    case "delivered":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";

    case "shipped":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";

    case "order recieved":
    case "processing":
    case "pending":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";

    case "return initiated":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
  }
};
function paginateOrders() {
  let filtered = orderDatas.filter((order) => {
    if (statusFilter === "All") return true;
    return getFilterStatus(order.status) === statusFilter;
  });

  filtered = filtered.filter((order) => {
    const term = searchTerm.toLowerCase();
    const name =
      (order.customerDetails.firstName + " " + order.customerDetails.lastName).toLowerCase();
    const id = order.razorpayPaymentId?.toLowerCase() || "";

    return (
      name.includes(term) ||
      id.includes(term) ||
      order.status.toLowerCase().includes(term) ||
      order.totalAmount.toString().includes(term)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  return filtered.slice(startIndex, startIndex + itemsPerPage);
}


  const viewOrderDetailsHandler = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeModal = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };
  
  const handleMarkCompleted = async (orderId: string) => {
    await axios.put("http://localhost:5000/api/order/update-status", {
      orderId,
      status: "Completed",
    });

    getOrdersByAdmin();
  };

  const handleDeleteOrder = async (orderId: string) => {
  try {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    const response = await axios.delete(
      `http://localhost:5000/api/order/${orderId}`
    );

    if (response.data.success !== false) {
      alert("Order deleted successfully");
      // Refresh orders
      getOrdersByAdmin();
    } else {
      alert("Failed to delete order: " + response.data.message);
    }
  } catch (error: any) {
    console.error("Delete order error:", error);
    alert("Failed to delete order. Please try again.");
  }
};

const getReturnTotal = (order: Order) => {
  return order.purchasedProducts
    .filter(
      (p) =>
        p.returnEligible === true &&
        p.returnStatus === "Return Initiated"
    )
    .reduce((sum, p) => sum + p.price * p.quantity, 0);
};

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header and Tabs Row */}
          <div className="flex justify-between items-center">
            <AdminHeader title="Orders" description="Manage customer orders" />

            {/* Tabs */}
           <div
  className="
    relative bg-muted rounded-xl p-1 mt-5
    flex flex-col gap-0      /* MOBILE: vertical list */
    md:flex md:flex-row md:gap-0  /* WEB: original row */
  "
>
  {(
    ["All", "Pending", "Delivered", "Return Initiated"] as const
  ).map((status) => (
    <Button
      key={status}
      variant="ghost"
      onClick={() => setStatusFilter(status)}
      className={`
        relative z-10 px-6 py-2 rounded-lg font-medium transition-colors
        ${
          statusFilter === status
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        }
      `}
    >
      {status}

      {statusFilter === status && (
        <motion.span
          layoutId="activeTab"
          className="
            absolute inset-0 bg-primary/10 rounded-lg
          "
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 25,
          }}
        />
      )}
    </Button>
  ))}
</div>

          </div>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-64"
            />
          </div>

          <Card className="overflow-hidden">
  {/* Desktop Table */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full">
      <thead className="bg-muted border-b border-border">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Payment ID</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
          <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">View</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {paginateOrders().map((order) => (
          <tr key={order._id} className="hover:bg-muted/50 transition-colors">
            <td className="px-6 py-4 text-sm font-semibold text-foreground">
              {order.razorpayPaymentId}
            </td>

            <td className="px-6 py-4">
              <p className="text-sm font-medium text-foreground">
                {order.customerDetails.firstName}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.customerDetails.email}
              </p>
            </td>

            <td className="px-6 py-4 text-sm font-semibold text-foreground">
              Rs.{" "}
              {order.status.toLowerCase() === "return initiated"
                ? getReturnTotal(order)
                : order.totalAmount}
            </td>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleMarkCompleted(order._id)}>
                    Mark as Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteOrder(order._id)}
                    className="text-red-600 cursor-pointer"
                  >
                    Delete Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

  {/* MOBILE CARD VIEW */}
  <div className="md:hidden space-y-3 p-3">
    {paginateOrders().map((order) => (
      <div key={order._id} className="border border-border rounded-xl p-3">
        <div className="text-sm font-semibold text-foreground">
          Payment: {order.razorpayPaymentId}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{order.customerDetails.firstName}</span>
          <span>
            {order.createdAt.slice(0, 10).split("-").reverse().join("-")}
          </span>
        </div>

        <div className="text-sm mt-2 font-semibold">
          Rs.{" "}
          {order.status.toLowerCase() === "return initiated"
            ? getReturnTotal(order)
            : order.totalAmount}
        </div>

        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-2 ${getStatusColor(
            order.status
          )}`}
        >
          {order.status}
        </span>

        {/* Action Buttons Row */}
        <div className="flex justify-between mt-3">
          <div className="flex gap-3">
            <button
              onClick={() => handleMarkCompleted(order._id)}
              className="p-1 bg-green-100 rounded-full"
            >
              <Check className="w-4 h-4 text-green-600" />
            </button>

            <button
              onClick={() => handleDeleteOrder(order._id)}
              className="p-1 bg-red-100 rounded-full"
            >
              <Trash className="w-4 h-4 text-red-600" />
            </button>
          </div>

          <button
            onClick={() => viewOrderDetailsHandler(order)}
            className="p-1 bg-blue-100 rounded-full"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* PAGINATION - SAME FOR ALL */}
  <div className="flex justify-center items-center gap-4 py-4">
    <Button
      variant="outline"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      className="px-6"
    >
      Previous
    </Button>

    <span className="text-sm font-medium text-muted-foreground">
      Page <span className="text-foreground">{currentPage}</span>
    </span>

    <Button
      variant="outline"
      disabled={orderDatas.length < itemsPerPage}
      onClick={() => setCurrentPage((p) => p + 1)}
      className="px-6"
    >
      Next
    </Button>
  </div>
</Card>

        </div>

        {/* Order Details Modal */}
        <Dialog open={showOrderDetails} onOpenChange={closeModal}>
  <DialogContent className="w-[95vw] sm:max-w-2xl p-4 sm:p-6 rounded-2xl">
    <DialogHeader className="border-b pb-3 sm:pb-4">
      <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground flex items-center justify-between">
        Order Details
      </DialogTitle>
      <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
        Detailed information about this order.
      </DialogDescription>
    </DialogHeader>

    {selectedOrder ? (
      <div className="space-y-5 sm:space-y-6 pt-3 sm:pt-4">
        
        {/* Customer & Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="rounded-xl border bg-white dark:bg-muted/20 p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase">
              Customer Info
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm leading-relaxed">
              <p><span className="font-semibold">Name:</span> {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</p>
              <p><span className="font-semibold">Email:</span> {selectedOrder.customerDetails.email}</p>
              <p><span className="font-semibold">Phone:</span> {selectedOrder.customerDetails.phone}</p>
              <p><span className="font-semibold">Address:</span> {selectedOrder.customerDetails.address}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white dark:bg-muted/20 p-4 sm:p-5 shadow-sm">
            <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase">
              Order Info
            </h3>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm leading-relaxed">
              <p><span className="font-semibold">Payment ID:</span> {selectedOrder.razorpayPaymentId}</p>
              <p className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </p>
              <p><span className="font-semibold">Date:</span> {selectedOrder.createdAt.slice(0, 10).split("-").reverse().join("-")}</p>
              <p>
                <span className="font-semibold">Total:</span>{" "}
                <span className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-300">
                  ₹{selectedOrder.status.toLowerCase() === "return initiated"
                    ? getReturnTotal(selectedOrder)
                    : selectedOrder.totalAmount}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Purchased Products */}
        <div className="border rounded-lg overflow-hidden">
          <h3 className="font-semibold text-base sm:text-lg bg-muted px-3 py-2">
            Purchased Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/70 border-b border-border">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Image</th>
                  <th className="px-3 py-2 text-left font-medium">Product</th>
                  <th className="px-3 py-2 text-left font-medium">Qty</th>
                  <th className="px-3 py-2 text-left font-medium">Price</th>
                  <th className="px-3 py-2 text-left font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder?.purchasedProducts
                  ?.filter(product => selectedOrder.status.toLowerCase() !== "return initiated" || product.returnStatus === "Return Initiated")
                  .map((product, index) => {
                    const fullProduct = allProducts?.find(
                      (p) => String(p._id) === String(product.productId)
                    );

                    return (
                      <tr key={index} className="border-b hover:bg-muted/40">
                        <td className="px-3 py-2">
                          <img
                            src={fullProduct?.mainImages?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium">{product.name}</td>
                        <td className="px-3 py-2">{product.quantity}</td>
                        <td className="px-3 py-2">₹{product.price}</td>
                        <td className="px-3 py-2 font-semibold">
                          ₹{product.price * product.quantity}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-semibold">
                  <td colSpan={4} className="px-3 py-3 text-right">Grand Total</td>
                  <td className="px-3 py-3">
                    ₹{selectedOrder.status.toLowerCase() === "return initiated"
                      ? getReturnTotal(selectedOrder)
                      : selectedOrder.totalAmount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    ) : (
      <p className="text-muted-foreground text-center py-6">No order selected.</p>
    )}

    <DialogFooter className="pt-3 border-t"></DialogFooter>
  </DialogContent>
</Dialog>

      </AdminLayout>
    </ProtectedRoute>
  );
}
