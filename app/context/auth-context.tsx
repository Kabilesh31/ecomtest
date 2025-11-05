"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"

// ✅ Unified user type (from both versions)
interface User {
  _id: string
  name: string
  email: string
  role: "admin" | "customer"
}

// ✅ Full AuthContext type (merged)
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

// ✅ Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ✅ Hook for using the context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

// ✅ Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 🔹 Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser: User = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    } else {
      setUser(null)
    }

    setIsLoading(false)
  }, [])

  // 🔹 Login function (smart handling for both backend URLs)
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // 🧠 Try your backend first
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned invalid response. Check backend.")
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || data.error || "Login failed")

      const userData: User = {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 Logout function
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
