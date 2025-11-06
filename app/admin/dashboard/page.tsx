"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"


export default function AdminDashboard() {

   const router = useRouter()

    useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [])
  return (
   <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          <AdminHeader title="Dashboard" description="Welcome to your admin panel" />

          {/* Stats Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-foreground">1,234</p>
                </div>
                <Package className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">567</p>
                </div>
                <ShoppingCart className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">$45.2K</p>
                </div>
                <BarChart3 className="w-10 h-10 text-primary/20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-foreground">892</p>
                </div>
                <Users className="w-10 h-10 text-primary/20" />
              </div>
            </Card>
          </div> */}

          {/* Quick Actions */}
          {/* <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/products/new">
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
          </Card> */}

          {/* Recent Activity */}
          {/* <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">New order #1001</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <span className="text-sm font-semibold text-primary">$299.99</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Product added: Premium Watch</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">New customer registered</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </Card> */}
        </div>
      </AdminLayout>
      </ProtectedRoute>
   
  )
}
