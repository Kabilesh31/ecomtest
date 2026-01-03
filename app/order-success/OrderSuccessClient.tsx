"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { ClientLayout } from "@/components/client/client-layout";
import { StepProgress } from "@/components/client/StepProgress";

function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/order/${orderId}`
        );
        setOrder(res.data.order);
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);
const th = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left" as const,
};

const td = {
  border: "1px solid #ddd",
  padding: "10px",
};

const Row = ({
  label,
  value,
  bold,
  big,
}: any) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      margin: "6px 0",
      fontWeight: bold ? "bold" : "normal",
      fontSize: big ? "16px" : "14px",
    }}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const handleDownloadInvoice = () => {
  if (!order) return;

  const doc = new jsPDF();

  let y = 20;

  // HEADER
  doc.setFontSize(18);
  doc.text("Ecom Invoice", 14, y);
  y += 8;

  doc.setFontSize(10);
  doc.text("Ecom", 14, y);
  y += 5;
  doc.text("Support: support@vecom.com", 14, y);
  y += 10;

  // ORDER INFO
  doc.setFontSize(11);
  doc.text(`Order ID: ${order._id}`, 14, y);
  y += 6;
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, y);
  y += 6;
  doc.text(`Payment Mode: ${order.paymentMode}`, 14, y);
  y += 10;

  // CUSTOMER
  doc.setFontSize(12);
  doc.text("Billing Address", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(
    `${order.customerDetails.firstName} ${order.customerDetails.lastName}`,
    14,
    y
  );
  y += 5;
  doc.text(order.customerDetails.address, 14, y);
  y += 5;
  doc.text(
    `${order.customerDetails.city}, ${order.customerDetails.state} - ${order.customerDetails.zipCode}`,
    14,
    y
  );
  y += 5;
  doc.text(`Phone: ${order.customerDetails.phone}`, 14, y);
  y += 10;

  // TABLE HEADER
  doc.setFontSize(11);
  doc.text("Items", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text("Item", 14, y);
  doc.text("Qty", 120, y);
  doc.text("Price", 140, y);
  doc.text("Total", 170, y);
  y += 4;

  doc.line(14, y, 195, y);
  y += 6;

  let subtotal = 0;

  order.purchasedProducts.forEach((item: any) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    doc.text(item.name, 14, y);
    doc.text(String(item.quantity), 120, y);
    doc.text(`₹${item.price}`, 140, y);
    doc.text(`₹${itemTotal}`, 170, y);
    y += 6;
  });

  y += 6;
  doc.line(14, y, 195, y);
  y += 6;

  const discount = order.discountAmount || 0;
  const tax = ((subtotal - discount) * 0.1).toFixed(2);
  const total = (subtotal - discount + Number(tax)).toFixed(2);

  // TOTALS
  doc.text(`Subtotal: ₹${subtotal}`, 140, y);
  y += 6;
  doc.text(`Discount: ₹${discount}`, 140, y);
  y += 6;
  doc.text(`Tax (10%): ₹${tax}`, 140, y);
  y += 6;

  doc.setFontSize(12);
  doc.text(`Grand Total: ₹${total}`, 140, y);

  y += 12;
  doc.setFontSize(10);
  doc.text("Thank you for shopping with Us!", 14, y);

  doc.save(`Invoice_${order._id}.pdf`);
};


  if (loading) return <p className="text-center mt-10">Loading order...</p>;
  if (!order) return <p className="text-center mt-10">Order not found</p>;

  const subtotal = order.purchasedProducts.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0
  );
  const discount = order.discountAmount || 0;
  const tax = +(0.1 * (subtotal - discount)).toFixed(2);
  const total = +(subtotal - discount + tax).toFixed(2);

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <StepProgress currentStep={3} />
        <h1 className="text-3xl font-bold text-green-600 mt-14 text-center">
          ✅ Order Placed Successfully
        </h1>

        <div
  ref={receiptRef}
  style={{
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#ffffff",
    color: "#111",
    padding: "32px",
    border: "1px solid #e5e5e5",
    borderRadius: "8px",
    maxWidth: "800px",
    margin: "0 auto",
  }}
>
  {/* HEADER */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "2px solid #f0f0f0",
      paddingBottom: "16px",
      marginBottom: "20px",
    }}
  >
    <div>
      <h2 style={{ fontSize: "22px", fontWeight: "bold", margin: 0 }}>
        Ecom
      </h2>
      <p style={{ margin: "4px 0", fontSize: "13px" }}>
        Devine Products Pvt Ltd
      </p>
      <p style={{ margin: "2px 0", fontSize: "12px" }}>
        📞 +91 98765 43210
      </p>
      <p style={{ margin: "2px 0", fontSize: "12px" }}>
        ✉ support@ecom.com
      </p>
    </div>

    <div style={{ textAlign: "right" }}>
      <h3 style={{ margin: 0 }}>INVOICE</h3>
      <p style={{ fontSize: "12px", margin: "4px 0" }}>
        Order ID: <strong>{order._id}</strong>
      </p>
      <p style={{ fontSize: "12px" }}>
        Date: {new Date(order.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>

  {/* CUSTOMER + PAYMENT */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "24px",
    }}
  >
    <div>
      <h4 style={{ marginBottom: "6px" }}>BILL TO</h4>
      <p style={{ margin: "2px 0" }}>
        {order.customerDetails.firstName}{" "}
        {order.customerDetails.lastName}
      </p>
      <p style={{ margin: "2px 0" }}>
        {order.customerDetails.address}
      </p>
      <p style={{ margin: "2px 0" }}>
        {order.customerDetails.city},{" "}
        {order.customerDetails.state} -{" "}
        {order.customerDetails.zipCode}
      </p>
      <p style={{ margin: "2px 0" }}>
        Phone: {order.customerDetails.phone}
      </p>
    </div>

    <div>
      <h4 style={{ marginBottom: "6px" }}>PAYMENT</h4>
      <p style={{ margin: "2px 0" }}>
        Mode: <strong>{order.paymentMode}</strong>
      </p>
      <p style={{ margin: "2px 0" }}>
        Status: {order.paymentStatus}
      </p>
    </div>
  </div>

  {/* PRODUCTS */}
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "24px",
      fontSize: "13px",
    }}
  >
    <thead>
      <tr style={{ backgroundColor: "#f6f6f6" }}>
        <th style={th}>#</th>
        <th style={th}>Item</th>
        <th style={{ ...th, textAlign: "right" }}>Qty</th>
        <th style={{ ...th, textAlign: "right" }}>Price</th>
        <th style={{ ...th, textAlign: "right" }}>Amount</th>
      </tr>
    </thead>
    <tbody>
      {order.purchasedProducts.map((item: any, i: number) => (
        <tr key={i}>
          <td style={td}>{i + 1}</td>
          <td style={td}>{item.name}</td>
          <td style={{ ...td, textAlign: "right" }}>
            {item.quantity}
          </td>
          <td style={{ ...td, textAlign: "right" }}>
            ₹{item.price}
          </td>
          <td style={{ ...td, textAlign: "right" }}>
            ₹{item.price * item.quantity}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* TOTAL */}
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <div style={{ width: "300px", fontSize: "14px" }}>
      <Row label="Subtotal" value={`₹${subtotal}`} />
      <Row label="Discount" value={`₹${discount}`} />
      <Row label="Tax (10%)" value={`₹${tax}`} />
      <hr />
      <Row
        label="TOTAL"
        value={`₹${total}`}
        bold
        big
      />
    </div>
  </div>

  {/* FOOTER */}
  <div
    style={{
      textAlign: "center",
      marginTop: "30px",
      fontSize: "12px",
      color: "#666",
    }}
  >
    Thank you for shopping with us ❤️ <br />
    Ecom
  </div>
</div>


        {/* ACTIONS */}
        <div className="flex gap-4 justify-center mt-4">
          <Button onClick={handleDownloadInvoice}>Download Invoice</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </ClientLayout>
  );
}
export default OrderSuccessClient;