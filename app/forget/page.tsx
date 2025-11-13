"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // <-- for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error sending reset link");
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form className="p-8 bg-white shadow-md rounded-md w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your email to receive a password reset link.
        </p>

        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" className="mt-4 w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        {/* Back to Login button */}
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => router.push("/account/login")}
        >
          Back to Login
        </Button>
      </form>
    </div>
  );
}
