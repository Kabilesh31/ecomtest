import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // For demo purposes, accept admin@example.com / password123
    if (email === "admin@example.com" && password === "password123") {
      return NextResponse.json(
        {
          id: "admin-1",
          email: "admin@example.com",
          role: "admin",
        },
        { status: 200 },
      )
    }

    // Invalid credentials
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
