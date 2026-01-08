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
          const adminRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
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
        
          toast.success("Welcome back, Admin!")
          sessionStorage.setItem("postLoginRefresh", "1");
router.push("/");

          return
        }

          // 🔹 If admin login failed, try user login
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
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
    sessionStorage.setItem("postLoginRefresh", "1");
router.push("/");
    
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
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import Link from "next/link"
// import toast from "react-hot-toast"
// import { useAuth, User } from "@/context/auth-context"

// // OTP Input Component (Hotstar-style)
// const OtpInput = ({ value, setValue, length = 6 }: { value: string, setValue: (val: string) => void, length?: number }) => {
//   const [otpValues, setOtpValues] = useState(Array(length).fill(""))
//   const inputsRef = useRef<Array<HTMLInputElement | null>>([])

//   // update parent state
//   useEffect(() => {
//     setValue(otpValues.join(""))
//   }, [otpValues])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
//     const val = e.target.value.replace(/\D/, "")
//     if (!val) return
//     const newOtp = [...otpValues]
//     newOtp[index] = val[0]
//     setOtpValues(newOtp)
//     if (index < length - 1) inputsRef.current[index + 1]?.focus()
//   }

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//     if (e.key === "Backspace") {
//       e.preventDefault()
//       const newOtp = [...otpValues]
//       newOtp[index] = ""
//       setOtpValues(newOtp)
//       if (index > 0) inputsRef.current[index - 1]?.focus()
//     }
//   }

//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
//     if (!pasteData) return
//     const newOtp = pasteData.split("")
//     setOtpValues([...newOtp, ...Array(length - newOtp.length).fill("")].slice(0, length))
//   }

//   return (
//     <div className="flex justify-between gap-2">
//       {otpValues.map((digit, idx) => (
//         <input
//           key={idx}
//           ref={el => { inputsRef.current[idx] = el }}
//           type="text"
//           maxLength={1}
//           value={digit}
//           onChange={e => handleChange(e, idx)}
//           onKeyDown={e => handleKeyDown(e, idx)}
//           onPaste={handlePaste}
//          className="w-8 h-8 sm:w-12 sm:h-12 text-center border rounded-md focus:ring-2 focus:ring-primary text-base sm:text-lg font-bold"
//         />
//       ))}
//     </div>
//   )
// }


// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")

//   const [mobile, setMobile] = useState("")
//   const [otp, setOtp] = useState("")
//   const [step, setStep] = useState<"login" | "otp">("login")
//   const [showAdmin, setShowAdmin] = useState(false)

//   const [error, setError] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()
//   const { setUser } = useAuth()

//   const otpRef = useRef<HTMLInputElement | null>(null)

//   // Autofocus first OTP box
//   useEffect(() => {
//     if (step === "otp") otpRef.current?.focus()
//   }, [step])

//   // Admin login
//   const handleAdminLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       })

//       if (res.ok) {
//         const data = await res.json()
//         const finalUser: User = {
//           _id: data.admin._id,
//           name: data.admin.name,
//           email: data.admin.email,
//           role: "admin",
//         }

//         localStorage.setItem("token", data.token || "")
//         setUser(finalUser)
//         toast.success("Welcome back, Admin!")
//         sessionStorage.setItem("postLoginRefresh", "1")
//         router.push("/")
//         return
//       }

//       toast.error("Invalid credentials")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   //  Send OTP
//   const sendOtp = async () => {
//     if (!mobile) return toast.error("Enter mobile number")

//     setIsLoading(true)
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile }),
//       })

//       if (res.ok) {
//         toast.success("OTP sent to WhatsApp")
//         setStep("otp")
//       } else {
//         const data = await res.json()
//         toast.error(data.message || "Failed to send OTP")
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Verify OTP
//   const verifyOtp = async () => {
//     if (!otp) return toast.error("Enter OTP")

//     setIsLoading(true)
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ mobile, otp }),
//       })

//       if (!res.ok) {
//         const data = await res.json()
//         toast.error(data.message || "Invalid OTP")
//         return
//       }

//       const data = await res.json()
//       const finalUser = data.user

//       localStorage.setItem("token", data.token)
//       setUser(finalUser)
//       toast.success("Login Successful!")
//       sessionStorage.setItem("postLoginRefresh", "1")
//       router.push("/")
//     } finally {
//       setIsLoading(false)
//     }
//   }
// useEffect(() => {
//   const token = localStorage.getItem("token")
//   if (token) {
//     router.replace("/")
//   }
// }, [router])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">E com</h1>
//           <p className="text-muted-foreground">Login Portal</p>
//         </div>

//         <Card className="p-8 w-full max-w-md shadow-lg">
//           <h2 className="text-2xl font-bold mb-6">Login</h2>
// {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

// {/* SHOW CUSTOMER LOGIN ONLY WHEN NOT SHOWING ADMIN */}
// {!showAdmin && step === "login" && (
//   <div className="space-y-4">
//     <Input
//       type="text"
//       placeholder="Mobile Number"
//       value={mobile}
//       onChange={e => setMobile(e.target.value)}
//     />

//     <Button onClick={sendOtp} className="w-full" disabled={isLoading}>
//       {isLoading ? "Sending OTP..." : "Send OTP via WhatsApp"}
//     </Button>

//     <button
//       type="button"
//       className="text-sm text-primary hover:underline mt-2 block"
//       onClick={() => setShowAdmin(true)}
//     >
//       Admin Login?
//     </button>
//   </div>
// )}

// {/* SHOW OTP ONLY WHEN NOT IN ADMIN MODE */}
// {!showAdmin && step === "otp" && (
//   <div className="space-y-4">
//     <OtpInput value={otp} setValue={setOtp} />
//     <Button onClick={verifyOtp} className="w-full" disabled={isLoading}>
//       {isLoading ? "Verifying..." : "Verify OTP"}
//     </Button>
//   </div>
// )}

// {/* SHOW ADMIN LOGIN ONLY WHEN showAdmin = TRUE */}
// {showAdmin && (
//   <form onSubmit={handleAdminLogin} className="space-y-4 mt-6">
//     <Input
//       type="email"
//       placeholder="Admin Email"
//       value={email}
//       onChange={e => setEmail(e.target.value)}
//     />
//     <Input
//       type="password"
//       placeholder="Admin Password"
//       value={password}
//       onChange={e => setPassword(e.target.value)}
//     />

//     <div className="flex justify-between items-center">
//       <button
//         type="button"
//         className="text-sm text-primary hover:underline"
//         onClick={() => setShowAdmin(false)}   // 🔥 SWITCH BACK
//       >
//         Back to Mobile Login
//       </button>

//       <Button type="submit" disabled={isLoading}>
//         {isLoading ? "Loading..." : "Admin Login"}
//       </Button>
//     </div>
//   </form>
// )}


//           <div className="text-right mt-2">
//             <Link href="/forget" className="text-sm text-primary hover:underline">
//               Forgot Password?
//             </Link>
//           </div>
//         </Card>

//         <div className="mt-6 text-center text-sm text-muted-foreground">
//           <p>
//             Don’t have an account?{" "}
//             <Link href="/account/login/sign-in" className="text-primary hover:underline font-medium">
//               Create New Account
//             </Link>
//           </p>
//           <Link href="/" className="hover:text-foreground transition-colors mt-2 block">
//             Back to Store
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }
