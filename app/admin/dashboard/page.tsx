"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import axios from "axios"
import { Counts } from "@/types/order"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [countData, setCountData] = useState<Counts>({
    orderCount: 0,
    productCount: 0,
    totalRevenue: 0,
    userCount: 0,
  })

  const [filter, setFilter] = useState<"today" | "7days" | "30days" | "custom">("today")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!isLoading) {
      if (!token || !user || user.role !== "admin") {
        router.push("/account/login")
      }
    }
  }, [user, isLoading])

  const getCounts = async (filterType: string, from?: string, to?: string) => {
    try {
      const response = await axios.get("http://localhost:5000/api/getCounts", {
        params: { role: user?.role, filter: filterType, from, to },
      })

      if (response.data.success) {
        setCountData(response.data)
      } else {
        alert(response.data.message)
      }
    } catch (err) {
      console.error("Failed to fetch counts:", err)
    }
  }

  useEffect(() => {
    if (user) {
      if (filter !== "custom") {
        getCounts(filter)
      } else if (fromDate && toDate) {
        getCounts("custom", fromDate, toDate)
      }
    }
  }, [user, filter, fromDate, toDate])

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header with filter dropdown */}
          <div className="flex items-center justify-between">
            <AdminHeader title="Dashboard" description="Welcome to your admin panel" />

            {/* Filter dropdown */}
            <div className="flex items-center space-x-3">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {filter === "custom" && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-[130px]"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-[130px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-foreground">{countData.productCount || 0}</p>
                </div>
                <Package className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{countData.orderCount || 0}</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">{countData.totalRevenue || 0}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-foreground">{countData.userCount || 0}</p>
                </div>
                <Users className="w-10 h-10 text-primary/20" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/products/add">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Add New Product
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Products
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full bg-transparent">
                  View Orders
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
