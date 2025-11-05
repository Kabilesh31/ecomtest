"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          <AdminHeader title="Add New Product" description="Create a new product with images and details" />
          <ProductForm />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
