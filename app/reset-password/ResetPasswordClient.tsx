"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return toast.error("Invalid reset link");
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/reset-password?token=${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {!success ? (
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white shadow-md rounded-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-4">Reset Password</h2>

          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-4"
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mb-4"
          />

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-white shadow-md rounded-md w-full max-w-md">
          <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Password Changed!
          </h2>
          <p className="text-gray-600 text-center">
            You can now log in with your new password.
          </p>
        </div>
      )}
    </div>
  );
}
