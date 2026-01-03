import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading order...</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
