"use client"

import type React from "react"

import { ClientHeader } from "./client-header"
import { ClientFooter } from "./client-footer"

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ClientHeader />
      <main className="flex-1">{children}</main>
      <ClientFooter />
    </div>
  )
}
