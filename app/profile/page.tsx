"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "react-hot-toast"
import { ClientLayout } from "@/components/client/client-layout"

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const [localUser, setLocalUser] = useState(user)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ mobile: "", address: "" })
  const [addresses, setAddresses] = useState<any[]>([])

  // Fetch user and addresses
  useEffect(() => {
    if (user) {
      setLocalUser(user)
      setFormData({
        mobile: user.mobile || "",
        address: user.address || "",
      })
      fetchAddresses(user._id)
    }
  }, [user])

  const fetchAddresses = async (userId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/getSavedAddress/${userId}`
      )
      if (res.data.success) {
        setAddresses(res.data.addressList)
      }
    } catch (err: any) {
      console.error("Fetch address error:", err.response?.data || err.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/update`,
        formData,
        { withCredentials: true }
      )
      setLocalUser(res.data.user)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    }
  }

if (isLoading || !localUser) {
  return (
    <ClientLayout>
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading user details...
      </div>
    </ClientLayout>
  )
}

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">My Profile</h1>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        {/* Basic Info */}
        <div className="space-y-3">
          <p><span className="font-medium">Name:</span> {localUser.name}</p>
          <p><span className="font-medium">Email:</span> {localUser.email}</p>
          <p><span className="font-medium">Role:</span> {localUser.role}</p>
          <p><span className="font-medium">User ID:</span> {localUser._id}</p>

          {isEditing ? (
            <>
              <div>
                <label className="block font-medium mb-1">Mobile</label>
                <Input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Address</label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>

              <Button onClick={handleSave} className="mt-3">
                Save Changes
              </Button>
            </>
          ) : (
            <p>
              <span className="font-medium">Mobile:</span>{" "}
              {localUser.mobile || "—"}
            </p>
          )}
        </div>

        {/* Saved Addresses Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>

          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <div
                  key={addr._id || index}
                  className="border rounded-lg p-4 hover:shadow-md transition-all bg-gray-50"
                >
                  <p className="font-medium">
                    {addr.firstName} {addr.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Address: {addr.add}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-600">Country: {addr.country}</p>
                  <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No saved addresses found.</p>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
