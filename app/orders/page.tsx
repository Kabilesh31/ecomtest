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
import { ClientLayout } from "@/components/client/client-layout";
import jsPDF from "jspdf";
import { Eye, Star } from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orderDatas, setOrderDatas] = useState<Order[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const [reviewData, setReviewData] = useState(
    {} as { [productId: string]: { rating: number; review: string } }
  );

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

  /* ==============================
    PDF Download Handler
  =============================== */
  const handlePdfOrderDownload = () => {
    if (!selectedOrder) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Ecom", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Order Invoice", 105, 30, { align: "center" });
    doc.line(15, 35, 195, 35);

    const customer = selectedOrder.customerDetails;

    doc.setFontSize(14);
    doc.text("Customer Information", 15, 45);
    doc.setFontSize(11);

    doc.text(
      `Name: ${customer?.firstName || ""} ${customer?.lastName || ""}`,
      15,
      55
    );
    doc.text(`Email: ${customer?.email || ""}`, 15, 62);
    doc.text(`Phone: ${customer?.phone || ""}`, 15, 69);
    doc.text(`Address: ${customer?.address || ""}`, 15, 76);

    doc.setFontSize(14);
    doc.text("Order Details", 120, 45);
    doc.setFontSize(11);

    const orderX = 120;
    const orderY = 55;

    doc.text(`Order ID: ${selectedOrder._id}`, orderX, orderY);
    doc.text(
      `Payment ID: ${selectedOrder.razorpayPaymentId}`,
      orderX,
      orderY + 7
    );
    doc.text(`Status: ${selectedOrder.status}`, orderX, orderY + 14);
    doc.text(
      `Date: ${selectedOrder.createdAt
        ?.slice(0, 10)
        .split("-")
        .reverse()
        .join("-")}`,
      orderX,
      orderY + 21
    );

    const startTableY = 100;
    doc.setFontSize(14);
    doc.text("Purchased Products", 15, startTableY);

    let currentY = startTableY + 7;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Product", 15, currentY);
    doc.text("Qty", 90, currentY);
    doc.text("Price", 120, currentY);
    doc.text("Total", 160, currentY);

    doc.line(15, currentY + 2, 195, currentY + 2);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    selectedOrder.purchasedProducts?.forEach((p) => {
      doc.text(p.name, 15, currentY);
      doc.text(String(p.quantity), 95, currentY);
      doc.text(`₹${p.price}`, 120, currentY);
      doc.text(`₹${p.price * p.quantity}`, 160, currentY);
      currentY += 7;
    });

    doc.line(15, currentY + 3, 195, currentY + 3);
    currentY += 12;

    doc.setFont("helvetica", "bold");
    doc.text(
      `Grand Total: ₹${selectedOrder.totalAmount}`,
      190,
      currentY,
      { align: "right" }
    );

    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, 285, {
      align: "center",
    });

    doc.save(`Order_${selectedOrder._id}.pdf`);
  };

  /* ==============================
    Star Rating Component
  =============================== */
  const StarRating = ({
    value,
    onChange,
    disabled = false,
  }: {
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
  }) => {
    return (
      <div className="flex gap-1 cursor-pointer">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={
              star <= value
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }
            onClick={() => !disabled && onChange(star)}
          />
        ))}
      </div>
    );
  };

  /* ==============================
    Submit Review Handler
  =============================== */
  const submitReviewHandler = async () => {
    try {
      for (let p of reviewOrder!.purchasedProducts) {
        const review = reviewData[p._id];

        if (!review?.rating) continue;

        await axios.post("http://localhost:5000/api/products/addReview", {
          orderId: reviewOrder!._id,
          productId: p.productId,
          customerId: user?._id,
          customerName: user?.name, // username
          rating: review.rating,
          message: review.review,
        });
      }

      alert("Review Submitted!");
      setShowReviewModal(false);
      setReviewData({});
      getOrdersByAdmin(); // refresh

    } catch (err) {
      console.log(err);
      alert("Failed to submit review");
    }
  };

  return (
    <ProtectedRoute requiredRole="customer">
      <ClientLayout>
        <div className="container mx-auto px-3 sm:px-6 py-6">

          {/* ================== HEADER ================== */}
          <h1 className="text-3xl font-bold text-center mb-6">My Orders</h1>

          {/* ================== ORDERS TABLE ================== */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">View</th>
                    <th className="px-4 py-3 text-center">Review</th>
                  </tr>
                </thead>

                <tbody>
                  {orderDatas.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">

                      <td className="px-4 py-4">{order.razorpayPaymentId}</td>

                      <td className="px-4 py-4">
                        {order.createdAt
                          ?.slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("-")}
                      </td>

                      <td className="px-4 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-right font-semibold">
                        ₹{order.totalAmount}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye size={14} />
                        </Button>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReviewOrder(order);
                            setShowReviewModal(true);
                          }}
                        >
                          <Star size={14} /> Review
                        </Button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* If no orders */}
          {orderDatas.length === 0 && (
            <p className="text-center mt-6 text-gray-500">
              You have no orders yet.
            </p>
          )}

          {/* ================== ORDER DETAILS DIALOG ================== */}
          <Dialog open={showOrderDetails} onOpenChange={() => setShowOrderDetails(false)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  Full information about this order.
                </DialogDescription>
              </DialogHeader>

              {selectedOrder ? (
                <div className="space-y-6">

                  {/* Customer Info */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Customer Info</h3>
                      <p><b>Name:</b> {selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</p>
                      <p><b>Email:</b> {selectedOrder.customerDetails.email}</p>
                      <p><b>Phone:</b> {selectedOrder.customerDetails.phone}</p>
                      <p><b>Address:</b> {selectedOrder.customerDetails.address}</p>
                    </div>

                    {/* Order info */}
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-2">Order Info</h3>
                      <p><b>Payment ID:</b> {selectedOrder.razorpayPaymentId}</p>
                      <p><b>Status:</b> <span className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</span></p>
                      <p><b>Date:</b> {selectedOrder.createdAt?.slice(0, 10).split("-").reverse().join("-")}</p>
                      <p><b>Total:</b> ₹{selectedOrder.totalAmount}</p>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="border rounded-xl overflow-x-auto">
                    <h3 className="font-semibold bg-muted p-3">
                      Purchased Products
                    </h3>

                    <table className="w-full text-sm">
                      <thead className="bg-muted border-b">
                        <tr>
                          <th className="px-3 py-2">Product</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedOrder.purchasedProducts.map((p, index) => (
                          <tr key={index} className="border-b">
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
                        <tr className="bg-muted font-semibold">
                          <td colSpan={3} className="text-right px-3 py-3">
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
                <p>No Order Selected</p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={handlePdfOrderDownload}>
                  Download PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ================== REVIEW MODAL ================== */}
          <Dialog open={showReviewModal} onOpenChange={() => setShowReviewModal(false)}>
            <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rate Your Order</DialogTitle>
                <DialogDescription>
                  Review each purchased product.
                </DialogDescription>
              </DialogHeader>

              {reviewOrder ? (
                <div className="space-y-5">
                  {reviewOrder.purchasedProducts.map((p) => {
                    const reviewed = p.review?.rating;

                    return (
                      <div
                        key={p._id}
                        className="border rounded-xl p-4 bg-white space-y-3"
                      >
                        <h3 className="font-semibold">{p.name}</h3>

                        {/* Already reviewed */}
                        {reviewed ? (
                          <>
                            <StarRating
                              value={p.review.rating}
                              onChange={() => {}}
                              disabled
                            />
                            <p className="text-sm italic">"{p.review.message}"</p>
                            <p className="text-xs text-green-700">
                              Reviewed on{" "}
                              {new Date(
                                p.review.reviewedAt
                              ).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <>
                            <StarRating
                              value={reviewData[p._id]?.rating || 0}
                              onChange={(val) =>
                                setReviewData((prev) => ({
                                  ...prev,
                                  [p._id]: {
                                    ...prev[p._id],
                                    rating: val,
                                  },
                                }))
                              }
                            />

                            <textarea
                              rows={3}
                              className="w-full border rounded-lg p-2"
                              placeholder="Write your review..."
                              value={reviewData[p._id]?.review || ""}
                              onChange={(e) =>
                                setReviewData((prev) => ({
                                  ...prev,
                                  [p._id]: {
                                    ...prev[p._id],
                                    review: e.target.value,
                                  },
                                }))
                              }
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No order selected.</p>
              )}

              <DialogFooter>
                <Button onClick={submitReviewHandler}>Submit Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </ClientLayout>
    </ProtectedRoute>
  );
}
