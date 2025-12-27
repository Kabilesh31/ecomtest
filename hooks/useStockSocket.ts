"use client"
import { useEffect, useState } from "react"

export function useStockSocket(onStockUpdate: (data: any) => void) {
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected")

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000") 

    socket.onopen = () => {
      console.log("📡 WebSocket Connected")
      setStatus("connected")
    }

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data)
        if (data.type === "STOCK_UPDATE") {
          onStockUpdate(data)
        }
      } catch (err) {
        console.log("Invalid WS data", err)
      }
    }

    socket.onerror = (err) => {
      console.log("WS error:", err)
      setStatus("disconnected")
    }

    socket.onclose = () => {
      console.log("🔴 WebSocket Closed")
      setStatus("disconnected")
    }

    return () => socket.close()
  }, [onStockUpdate])

  return { status }
}
