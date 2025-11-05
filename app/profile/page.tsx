"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { toast } from "react-hot-toast"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const [localUser, setLocalUser] = useState(user)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ mobile: "", address: "" })

  useEffect(() => {
    if (user) {
      setLocalUser(user)
      setFormData({
        mobile: user.mobile || "",
        address: user.address || "",
      })
    }
  }, [user])

  if (isLoading || !localUser) {
    return <div className="text-center mt-10 text-lg">Loading user details...</div>
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
      { withCredentials: true } // 🔥 include cookies
    );
    setLocalUser(res.data.user);
    toast.success("Profile updated successfully");
    setIsEditing(false);
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update profile");
  }
};


  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

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

            <Button onClick={handleSave} className="mt-3">Save Changes</Button>
          </>
        ) : (
          <>
            <p><span className="font-medium">Mobile:</span> {localUser.mobile || "—"}</p>
            <p><span className="font-medium">Address:</span> {localUser.address || "—"}</p>
          </>
        )}
      </div>
    </div>
  )
}
