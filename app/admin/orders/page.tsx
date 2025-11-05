import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import axios from "axios"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"

const mockOrders = [
  {
@@ -37,7 +40,36 @@ const mockOrders = [
  },
]


export default function OrdersPage() {
  const {user} = useAuth();

  const [orderDatas, setOrderDatas] = useState([]);

  
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
@@ -57,40 +89,40 @@ export default function OrdersPage() {
        <div className="space-y-6">
          <AdminHeader title="Orders" description="Manage customer orders" />

          {/* <Card className="overflow-hidden">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Payment ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Items</th>
                    {/* <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Items</th> */}
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{order.id}</td>
                  {orderDatas.map((order) => (
                    <tr key={order._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{order.razorpayPaymentId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{order.customer}</p>
                          <p className="text-sm font-medium text-foreground">{order.customerDetails.firstName}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.items}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">${order.total}</td>
                      {/* <td className="px-6 py-4 text-sm text-muted-foreground">{order.items}</td> */}
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">Rs. {order.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.createdAt.slice(0,10).split("-").reverse().join("-")}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4" />
@@ -101,7 +133,7 @@ export default function OrdersPage() {
                </tbody>
              </table>
            </div>
          </Card> */}
          </Card>
        </div>
      </AdminLayout>
