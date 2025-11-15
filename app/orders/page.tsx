 "use client";    

import { ProtectedRoute } from "@/components/protected-route";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { Order } from "@/types/order";
import { ClientLayout } from "@/components/client/client-layout"
import jsPDF from "jspdf";
import { Eye, Star } from "lucide-react";
export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orderDatas, setOrderDatas] = useState<Order[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState(
    {} as { [productId: string]: { rating: number; review: string } }
    );
const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const getOrdersByAdmin = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/order/getOrdersById/${user?._id}`
      );

      if (response.status === 200) {
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeModal = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Processing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

const handlePdfOrderDownload = () => {
  if (!selectedOrder) return;

  const doc = new jsPDF();

  // ----- HEADER -----
  doc.setFontSize(18);
  doc.text("Ecom", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text("Order Invoice", 105, 30, { align: "center" });

  doc.line(15, 35, 195, 35); // separator line

  // ----- CUSTOMER INFO (LEFT SIDE) -----
  doc.setFontSize(14);
  doc.text("Customer Information", 15, 45);
  doc.setFontSize(11);

  const customer = selectedOrder.customerDetails;
  doc.text(`Name: ${customer?.firstName || ""} ${customer?.lastName || ""}`, 15, 55);
  doc.text(`Email: ${customer?.email || ""}`, 15, 62);
  doc.text(`Phone: ${customer?.phone || ""}`, 15, 69);
  doc.text(`Address: ${customer?.address || ""}`, 15, 76);

  // ----- ORDER INFO (RIGHT SIDE) -----
  doc.setFontSize(14);
  doc.text("Order Details", 120, 45);
  doc.setFontSize(11);

  const orderX = 120; // starting X position on right side
  const orderY = 55;

  doc.text(`Order ID: ${selectedOrder._id}`, orderX, orderY);
  doc.text(`Payment ID: ${selectedOrder.razorpayPaymentId || "N/A"}`, orderX, orderY + 7);
  doc.text(`Status: ${selectedOrder.status}`, orderX, orderY + 14);
  doc.text(`Date: ${selectedOrder.createdAt?.slice(0, 10).split("-").reverse().join("-")}`, orderX, orderY + 21);

  // ----- PRODUCTS TABLE -----
  const startTableY = 100;
  doc.setFontSize(14);
  doc.text("Purchased Products", 15, startTableY);

  const headers = ["Product", "Qty", "Price", "Total"];
  let currentY = startTableY + 7;

  // Table header
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(headers[0], 15, currentY);
  doc.text(headers[1], 90, currentY);
  doc.text(headers[2], 120, currentY);
  doc.text(headers[3], 160, currentY);

  doc.line(15, currentY + 2, 195, currentY + 2);
  currentY += 8;

  // Table rows
  doc.setFont("helvetica", "normal");
  selectedOrder.purchasedProducts?.forEach((p) => {
    doc.text(p.name, 15, currentY);
    doc.text(String(p.quantity), 95, currentY);
    doc.text(`Rs. ${p.price}`, 120, currentY);
    doc.text(`Rs. ${p.price * p.quantity}`, 160, currentY);
    currentY += 7;
  });

  // ----- TOTAL -----
  doc.line(15, currentY + 3, 195, currentY + 3);
  currentY += 12;
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${selectedOrder.totalAmount}`, 190, currentY, { align: "right" });

  // ----- FOOTER -----
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your purchase!", 105, 285, { align: "center" });
  // doc.text("www.vilavamsofttech.in", 105, 292, { align: "center" });

  // Save PDF
  doc.save(`Order_${selectedOrder.razorpayPaymentId || selectedOrder._id}.pdf`);
};


const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  return (
    <div className="flex gap-1 cursor-pointer">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          className={star <= value ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
};

   return (
  <ProtectedRoute requiredRole="customer">
    <ClientLayout>
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-center flex-1 -ml-6 sm:-ml-10">
            My Orders
          </h1>
        </div>

        {/* Orders Table */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px] sm:min-w-full">
              <thead className="bg-gray-100">
                <tr className="text-gray-700">
                  <th className="px-4 sm:px-6 py-3 font-semibold whitespace-nowrap">
                    Payment ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 font-semibold whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 font-semibold">Status</th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-right">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-center">
                    View
                  </th>
                  <th className="px-4 sm:px-6 py-3 font-semibold text-center">
                    Review
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderDatas.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 font-medium">
                      {order.razorpayPaymentId}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      {order.createdAt
                        ?.slice(0, 10)
                        .split("-")
                        .reverse()
                        .join("-")}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-semibold">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <Eye size={14}/>
                      </Button>
                    </td>

                     <td className="px-4 sm:px-6 py-4 text-center">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewOrder(order);
                          setShowReviewModal(true);
                        }}
                      >
                        <Star size={14} />
                        Rate your Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {orderDatas.length === 0 && (
          <p className="text-center text-muted-foreground mt-6">
            You have no orders yet.
          </p>
        )}

        {/* ---------------- Dialog for Order Details ---------------- */}
        <Dialog open={showOrderDetails} onOpenChange={closeModal}>
          <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Order Details
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Detailed information about this order.
              </DialogDescription>
            </DialogHeader>

            {selectedOrder ? (
              <div className="space-y-6 pt-4">
                {/* Customer + Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Customer Info */}
                  <div className="rounded-xl border bg-white dark:bg-muted/20 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                      Customer Info
                    </h3>
                    <div className="space-y-2 text-sm leading-relaxed">
                      <p>
                        <span className="font-semibold">Name:</span>{" "}
                        {selectedOrder.customerDetails?.firstName}{" "}
                        {selectedOrder.customerDetails?.lastName}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {selectedOrder.customerDetails?.email}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {selectedOrder.customerDetails?.phone}
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span>{" "}
                        {selectedOrder.customerDetails?.address}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="rounded-xl border bg-white dark:bg-muted/20 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase">
                      Order Info
                    </h3>
                    <div className="space-y-2 text-sm leading-relaxed">
                      <p>
                        <span className="font-semibold">Payment ID:</span>{" "}
                        {selectedOrder.razorpayPaymentId}
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {selectedOrder.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {selectedOrder.createdAt
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        <span className="font-semibold text-green-700">
                          ₹{selectedOrder.totalAmount}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="border rounded-lg overflow-x-auto">
                  <h3 className="font-semibold text-base sm:text-lg bg-muted px-4 py-2">
                    Purchased Products
                  </h3>
                  <table className="w-full text-sm min-w-[400px]">
                    <thead className="bg-muted/70 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          Product
                        </th>
                        <th className="px-3 py-2 text-left font-medium">Qty</th>
                        <th className="px-3 py-2 text-left font-medium">
                          Price
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.purchasedProducts?.map((p, i) => (
                        <tr key={i} className="border-b">
                          <td className="px-3 py-2">{p.name}</td>
                          <td className="px-3 py-2">{p.quantity}</td>
                          <td className="px-3 py-2">₹{p.price}</td>
                          <td className="px-3 py-2 font-semibold">
                            ₹{p.price * p.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-semibold">
                        <td
                          colSpan={3}
                          className="px-3 py-3 text-right text-foreground"
                        >
                          Grand Total
                        </td>
                        <td className="px-3 py-3">
                          ₹{selectedOrder.totalAmount}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No order selected.
              </p>
            )}

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={handlePdfOrderDownload}>
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
              {/* ---------------- Review Modal ---------------- */}
        <Dialog open={showReviewModal} onOpenChange={() => setShowReviewModal(false)}>
          <DialogContent className="sm:max-w-xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold">Rate Your Order</DialogTitle>
              <DialogDescription>
                Share your feedback for each product you purchased.
              </DialogDescription>
            </DialogHeader>

            {reviewOrder ? (
              <div className="space-y-5 max-h-[60vh] overflow-y-auto px-1">

                {reviewOrder.purchasedProducts.map((p) => (
                  <div key={p._id} className="border rounded-xl p-4 bg-white shadow-sm space-y-3">

                    {/* Product Name */}
                    <h3 className="font-semibold text-base">{p.name}</h3>

                    {/* Star Rating */}
                    <StarRating
                      value={reviewData[p._id]?.rating || 0}
                      onChange={(val) =>
                        setReviewData((prev) => ({
                          ...prev,
                          [p._id]: { ...prev[p._id], rating: val }
                        }))
                      }
                    />

                    {/* Review Input */}
                    <textarea
                      className="w-full border rounded-lg p-2 text-sm focus:ring focus:ring-blue-200"
                      rows={3}
                      placeholder="Write your review..."
                      value={reviewData[p._id]?.review || ""}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          [p._id]: { ...prev[p._id], review: e.target.value }
                        }))
                      }
                    />
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-center text-muted-foreground py-5">No Order Selected</p>
            )}

            <DialogFooter>
              <Button
                onClick={() => {
                  console.log("Sending Review: ", reviewData);
                  // TODO: API call
                  setShowReviewModal(false);
                }}
              >
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
                
      </div>

      
    </ClientLayout>
  </ProtectedRoute>
)

}
