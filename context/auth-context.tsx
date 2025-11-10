"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  billingSameAsShipping?: boolean
  billingFirstName?: string
  billingLastName?: string
  billingStreet?: string
  billingCity?: string
  billingState?: string
  billingZipCode?: string
}

// ✅ Common user type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  mobile?: string
  address?: string
}

// ✅ Context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Admin login
      const adminRes = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        const adminUser: User = {
          _id: adminData._id,
          name: adminData.name,
          email: adminData.email,
          role: "admin",
        };

        localStorage.setItem("token", adminData.token);
        localStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        toast.success("Welcome, Admin!");
        return;
      }

      // Normal user login
      const userRes = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.message || "Invalid credentials");

      const normalUser: User = {
        _id: userData.user._id,
        name: userData.user.name,
        email: userData.user.email,
        role: userData.user.role || "customer",
      };

      localStorage.setItem("token", userData.token);
      localStorage.setItem("user", JSON.stringify(normalUser));
      setUser(normalUser);
      toast.success("Login successful!");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully!");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
