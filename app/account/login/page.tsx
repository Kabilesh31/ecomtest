  "use client"

  import { useState } from "react"
  import { useRouter } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Card } from "@/components/ui/card"
  import Link from "next/link"
  import toast from "react-hot-toast"
  import { useAuth, User } from "@/context/auth-context"
  

  export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { setUser } = useAuth() // ✅ use context to update user immediately

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsLoading(true)

      try {
        // 🔹 Try admin login first
        const adminRes = await fetch("http://localhost:5000/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (adminRes.ok) {
        const adminData = await adminRes.json()
        console.log("Logged in admin:", adminData);
        const finalUser: User = {
        _id: adminData.admin._id,
        name: adminData.admin.name,
        email: adminData.admin.email,
        role: "admin",
      };

      console.log(adminData)
      localStorage.setItem("token", adminData.token || ""); // set token if your API returns it
      // localStorage.setItem("user", JSON.stringify(finalUser));
      setUser(finalUser);
      toast.success("Welcome back, Admin!");
      router.push("/");
      router.refresh();
        toast.success("Welcome back, Admin!")
        router.push("/")
        router.refresh()
        return
      }

        // 🔹 If admin login failed, try user login
        const userRes = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (userRes.ok) {
          const userData = await userRes.json()
          const finalUser = userData.user || { ...userData, role: "customer", _id: userData._id }

          localStorage.setItem("token", userData.token)
          // localStorage.setItem("user", JSON.stringify(finalUser))
          setUser(finalUser) // ✅ instantly updates header
          toast.success("Login Successfully!")
  router.push("/")
  router.refresh()
  return
        }

        // 🔹 Both failed
        const adminMsg = await safeParseJsonMessage(adminRes)
        const userMsg = await safeParseJsonMessage(userRes)
        const message = adminMsg || userMsg || "Invalid credentials"
        setError(message)
        toast.error(message)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed"
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }

    // helper: safely extract message from response
    async function safeParseJsonMessage(res: Response | undefined) {
      try {
        if (!res) return null
        const json = await res.json().catch(() => null)
        if (!json) return null
        return json.message || json.error || null
      } catch {
        return null
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">E com</h1>
            <p className="text-muted-foreground">Login Portal</p>
          </div>

          <Card className="p-8 w-full max-w-md shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
              <div className="text-right mt-2">
    <Link
      href="/forget"
      className="text-sm text-primary hover:underline"
    >
      Forgot Password?
    </Link>
  </div>
          </form>
        </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Don’t have an account?{" "}
              <Link href="/account/login/sign-in" className="text-primary hover:underline font-medium">
                Create New Account
              </Link>
            </p>
            <Link href="/" className="hover:text-foreground transition-colors mt-2 block">
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    )
  }
