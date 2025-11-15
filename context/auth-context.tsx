"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

// ✅ JWT Payload type
interface JwtPayload {
  id: string;
  exp?: number;
  iat?: number;
}

// ✅ Common user type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  mobile?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch user/admin by ID
  const fetchUserById = async (id: string) => {
    console.log("Fetching user by ID:", id);
    try {
      const res = await fetch(`http://localhost:5000/api/users/getUser/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch user");

      // ✅ Handle both admin and user response
      const fetchedUser = data.user || data.admin;
      setUser(fetchedUser);


    } catch (error) {
      console.error("Error fetching user by ID:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);

        // ✅ Check token expiry
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired");
          logout();
        } else if (decoded.id) {
          fetchUserById(decoded.id);
        } else {
          console.warn("No ID found in token");
          logout();
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        logout();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // ✅ Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ Save token
      localStorage.setItem("token", data.token);
      console.log()
      // ✅ Decode and fetch user by ID
      const decoded = jwtDecode<JwtPayload>(data.token);
      if (decoded.id) {
        localStorage.setItem("userId", decoded.id)
        await fetchUserById(decoded.id);
      } else {
        throw new Error("Invalid token: missing user ID");
      }

      toast.success("Login successful!");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Invalid email or password");
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
