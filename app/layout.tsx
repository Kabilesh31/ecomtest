import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "@/styles/cropper.css";
import { AuthProvider } from "../context/auth-context"
import { CartProvider } from "../context/cart-context"
import { Toaster } from "react-hot-toast";
import Script from "next/script"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ecom",
  description: "Discover premium products with professional e-commerce experience",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
          <CartProvider>
            {children}
             <Toaster position="bottom-right" reverseOrder={false} />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
