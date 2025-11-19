// hooks/useStockUpdates.js
import { useEffect, useState } from "react";

export default function useStockUpdates() {
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000"); // connect to your backend WS

    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "stockUpdate") {
          const { productId, stock } = msg.data;
          setStockData(prev => ({ ...prev, [productId]: stock }));
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    return () => ws.close();
  }, []);

  return stockData;
}
