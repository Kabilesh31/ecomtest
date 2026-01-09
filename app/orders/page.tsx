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
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import {
  Eye,
  Star,
  Download,
  Calendar,
  User,
  Package,
  CreditCard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orderDatas, setOrderDatas] = useState<Order[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [selectedReturnProducts, setSelectedReturnProducts] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<
    Record<string, string | null>
  >({});
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  

  const [reviewData, setReviewData] = useState(
    {} as { [productId: string]: { rating: number; review: string } }
  );

  const getOrdersByAdmin = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products/getOrders/${user?._id}`
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
  const getProductImage = async (productId: string): Promise<string | null> => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`
      );
      return res.data?.mainImages?.[0] || null;
    } catch (err) {
      return null;
    }
  };
  useEffect(() => {
    if (user && orderDatas.length === 0) {
      getOrdersByAdmin();
    }
  }, [user, orderDatas]);
const isWithin7Days = (createdAt: string) => {
  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffDays =
    (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  useEffect(() => {
    const loadImages = async () => {
      if (!selectedOrder) return;

      const results: Record<string, string | null> = {};

      for (const item of selectedOrder.purchasedProducts) {
        results[item.productId] = await getProductImage(item.productId);
      }

      setProductImages(results);
    };

    loadImages();
  }, [selectedOrder]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "order cancelled":
      case "order canceled":
        return "bg-red-100 text-red-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
      doc.text(`${p.price}`, 120, currentY);
      doc.text(`${p.price * p.quantity}`, 160, currentY);
      currentY += 7;
    });
    doc.line(15, currentY + 3, 195, currentY + 3);
    currentY += 12;
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ${selectedOrder.totalAmount}`, 190, currentY, {
      align: "right",
    });
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, 285, {
      align: "center",
    });
    doc.save(`Order_${selectedOrder._id}.pdf`);
  };
const submitReturnRequest = async () => {
  if (selectedReturnProducts.length === 0) {
    toast.error("Please select at least one product");
    return;
  }

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/order/initiate-return`,
      {
        orderId: selectedOrder?._id,
        products: selectedReturnProducts.map((id) => ({
          productId: id,
        })),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Return request submitted successfully");
    setShowReturnModal(false);
    setSelectedReturnProducts([]);
    getOrdersByAdmin(); // refresh orders
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit return request");
  }
};




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
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/order`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.log("Fetch Orders Error:", err);
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);
  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    console.log("Cancelling order:", selectedOrderId);

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/order/cancel/${selectedOrderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Cancel response:", res.data);

      setShowCancelModal(false);
      setSelectedOrderId(null);
      fetchOrders();
      toast.success("Order Cancelled Successfully");
    } catch (error: any) {
      console.error(
        "Cancel order error:",
        error.response?.data || error.message
      );
      toast.error("Failed to cancel order");
    }
  };

  const handleSendInvoiceWhatsapp = async () => {
    if (!selectedOrder) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/order/send-invoice-whatsapp`,
        {
          orderId: selectedOrder._id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);
      toast.success("Invoice sent to WhatsApp 📲");
    } catch (error: any) {
      console.error("Send Invoice Error:", error.response?.data || error);
      toast.error("Failed to send invoice");
    }
  };

  const submitReviewHandler = async () => {
    try {
      const reviewsToSubmit = [];

      for (let p of reviewOrder!.purchasedProducts) {
        const review = reviewData[p._id];

        if (p.reviews && p.reviews.length > 0) {
          console.log(`Skipping ${p.name} - already reviewed`);
          continue;
        }

        if (review?.rating && review.review?.trim()) {
          reviewsToSubmit.push({
            productId: p.productId,
            rating: review.rating,
            message: review.review.trim(),
          });
        } else if (review?.rating && !review.review?.trim()) {
          alert(`Please add a review message for ${p.name}`);
          return;
        }
      }
      if (reviewsToSubmit.length === 0) {
        alert("Please add ratings and reviews for products you want to review");
        return;
      }
      console.log("Submitting reviews:", reviewsToSubmit);

      for (const review of reviewsToSubmit) {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/products/addReview`,
          {
            orderId: reviewOrder!._id,
            productId: review.productId,
            customerId: user?._id,
            customerName: user?.name,
            rating: review.rating,
            message: review.message,
          }
        );
        console.log(
          `Review submitted for product ${review.productId}:`,
          response.data
        );
      }
      alert("Reviews Submitted Successfully!");
      setShowReviewModal(false);
      setReviewData({});
      getOrdersByAdmin();
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      if (err.response?.data?.message) {
        alert(`Failed: ${err.response.data.message}`);
      } else {
        alert("Failed to submit review. Please try again.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return dateString?.slice(0, 10).split("-").reverse().join("-");
  };

  const truncatePaymentId = (paymentId: string) => {
    if (!paymentId) return "";
    return paymentId.length > 12
      ? `${paymentId.substring(0, 8)}...`
      : paymentId;
  };

  return (
    <ProtectedRoute requiredRole="customer">
      <ClientLayout>
        <div className="container mx-auto px-3 sm:px-6 py-4">
          <h1 className="text-2xl font-bold text-center mb-6">My Orders</h1>

          <div className="space-y-4 md:hidden">
            {orderDatas.map((order) => (
              <Card
                key={order._id}
                className="p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
  <CreditCard size={16} className="text-gray-500" />
  <span className="text-sm font-medium text-gray-700">
    {order.razorpayPaymentId
      ? truncatePaymentId(order.razorpayPaymentId)
      : truncatePaymentId(order._id)}
  </span>
</div>

                  <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package size={14} />
                    <span>{order.purchasedProducts?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-1 text-xs"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye size={14} />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-1 text-xs"
                    onClick={() => {
                      setReviewOrder(order);
                      setShowReviewModal(true);
                    }}
                  >
                    <Star size={14} />
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* ================== DESKTOP TABLE VIEW ================== */}
          <Card className="p-0 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px] table-fixed text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">View</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">More</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDatas.map((order) => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
  {order.razorpayPaymentId ? order.razorpayPaymentId : order._id}
</td>

                      <td className="px-4 py-4">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye size={14} />
                        </Button>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 py-1"
                          onClick={() => {
                            setReviewOrder(order);
                            setShowReviewModal(true);
                          }}
                        >
                          <Star size={14} />
                          Review
                        </Button>
                      </td>
                      

                      <td className="text-center">
  {order.status.toLowerCase() !== "order canceled" && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 rounded hover:bg-gray-100">
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Cancel Order */}
        {order.status === "order Recieved" && (
          <DropdownMenuItem
            onClick={() => {
              setSelectedOrderId(order._id);
              setShowCancelModal(true);
            }}
          >
            Cancel Order
          </DropdownMenuItem>
        )}

        {/* Return / Replacement */}
         
         <DropdownMenuItem
  onClick={() => {
    if (!isWithin7Days(order.createdAt)) {
      toast.error("Return window expired (7 days)");
      return;
    }

    setSelectedOrder(order);
    setShowReturnModal(true);
  }}
>
  Return / Replacement
</DropdownMenuItem>

        
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Order</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel this order?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  No
                </Button>
                <Button className="bg-red-600" onClick={handleCancelOrder}>
                  Yes, Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
  <DialogContent className="max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Return / Replacement</DialogTitle>
      <DialogDescription>
        Select return-eligible products (within 7 days)
      </DialogDescription>
    </DialogHeader>

    {/* Check if order is within 7 days */}
    {!selectedOrder || !isWithin7Days(selectedOrder.createdAt) ? (
      <p className="text-center text-sm text-gray-500 py-4">
        Return window expired (7 days)
      </p>
    ) : selectedOrder.purchasedProducts?.filter(
        (p: any) => p.returnEligible
      ).length === 0 ? (
      <p className="text-center text-sm text-gray-500 py-4">
        No return-eligible products in this order
      </p>
    ) : (
      // Show only return-eligible products
      selectedOrder.purchasedProducts
        .filter((p: any) => p.returnEligible)
        .map((p: any) => (
          <div
            key={p._id}
            className="flex items-center gap-3 border rounded-lg p-3 mb-2"
          >
            <input
              type="checkbox"
              checked={selectedReturnProducts.includes(p.productId)}
              onChange={() => {
                setSelectedReturnProducts((prev) =>
                  prev.includes(p.productId)
                    ? prev.filter((id) => id !== p.productId)
                    : [...prev, p.productId]
                );
              }}
            />

            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-gray-500">
                Qty: {p.quantity} | ₹{p.price}
              </p>
            </div>
          </div>
        ))
    )}

    <DialogFooter>
      <Button
        disabled={selectedReturnProducts.length === 0}
        onClick={submitReturnRequest}
      >
        Submit Return
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>




          {orderDatas.length === 0 && (
            <p className="text-center mt-6 text-gray-500">
              You have no orders yet.
            </p>
          )}

          <Dialog
            open={showOrderDetails}
            onOpenChange={() => setShowOrderDetails(false)}
          >
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
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <User size={16} />
                        Customer Info
                      </h3>
                      <p>
                        <b>Name:</b> {selectedOrder.customerDetails.firstName}{" "}
                        {selectedOrder.customerDetails.lastName}
                      </p>
                      <p>
                        <b>Email:</b> {selectedOrder.customerDetails.email}
                      </p>
                      <p>
                        <b>Phone:</b> {selectedOrder.customerDetails.phone}
                      </p>
                      <p>
                        <b>Address:</b> {selectedOrder.customerDetails.address}
                      </p>
                    </div>
                    {/* Order info */}
                    <div className="border rounded-xl p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Package size={16} />
                        Order Info
                      </h3>
                      <p>
                        <b>Payment ID:</b> {selectedOrder.razorpayPaymentId}
                      </p>
                      <p>
                        <b>Status:</b>{" "}
                        <span className={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </span>
                      </p>
                      <p>
                        <b>Date:</b> {formatDate(selectedOrder.createdAt)}
                      </p>
                      <p>
                        <b>Total:</b> ₹{selectedOrder.totalAmount}
                      </p>
                    </div>
                  </div>
                  {/* Products */}
                  <div className="border rounded-xl overflow-x-auto">
                    <h3 className="font-semibold bg-muted p-3">
                      Purchased Products
                    </h3>
                    <table className="w-full text-sm table-auto">
                      <thead className="bg-muted border-b">
                        <tr>
                          <th className="px-3 py-3 text-left">Product</th>
                          <th className="px-3 py-2 text-left">Qty</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedOrder.purchasedProducts.map((p, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-3 py-2">
                              {/* Wrapping in div fixes alignment */}
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    productImages[p.productId] ||
                                    "/placeholder.png"
                                  }
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-md border"
                                />
                                <span>{p.name}</span>
                              </div>
                            </td>

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
                <Button
                  variant="outline"
                  onClick={handlePdfOrderDownload}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </Button>
                {/* <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleSendInvoiceWhatsapp}
                >
                  <Package size={16} />
                  Send to WhatsApp
                </Button> */}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showReviewModal}
            onOpenChange={() => {
              setShowReviewModal(false);
              setReviewData({});
            }}
          >
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
                    const hasReview =
                      p.review && p.review.rating && p.review.message;
                    return (
                      <div
                        key={p._id}
                        className="border rounded-xl p-4 bg-white space-y-3"
                      >
                        <h3 className="font-semibold">{p.name}</h3>
                        {/* Already reviewed - Show read-only */}
                        {hasReview ? (
                          <>
                            <StarRating
                              value={p.review?.rating ?? 0}
                              onChange={() => {}}
                              disabled
                            />
                            <p className="text-sm italic">
                              "{p.review?.message}"
                            </p>
                            <p>
                              {p.review?.reviewedAt &&
                                new Date(
                                  p.review.reviewedAt
                                ).toLocaleDateString()}
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
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
                              <span className="text-sm text-gray-500">
                                {reviewData[p._id]?.rating || 0}/5
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              className="w-full border rounded-lg p-2 text-sm"
                              placeholder="Share your experience with this product..."
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
                            {/* Validation message */}
                            {reviewData[p._id]?.rating &&
                              !reviewData[p._id]?.review && (
                                <p className="text-xs text-amber-600">
                                  Please add a review message for your rating
                                </p>
                              )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No order selected.</p>
              )}
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReviewHandler}
                  disabled={Object.keys(reviewData).length === 0}
                >
                  Submit Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ClientLayout>
    </ProtectedRoute>
  );
}
