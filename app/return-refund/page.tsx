"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientLayout } from "@/components/client/client-layout"

export default function ReturnRefundPage() {
  const router = useRouter();

  return (
    <ClientLayout>
    <div className="max-w-4xl mx-auto p-6 text-foreground">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        
        <h1 className="text-3xl font-bold text-center flex-1">
          Return & Refund Policy
        </h1>
        <div className="w-[80px]" /> {/* Spacer for symmetry */}
      </div>

      <p className="text-sm text-muted-foreground mb-8 text-center">
        Last Updated: November 7, 2025
      </p>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          Thank you for shopping with <strong>Ecom</strong>. We want you to have
          a smooth and satisfying shopping experience. If you’re not completely
          happy with your purchase, this policy explains how returns and refunds
          are handled.
        </p>

        <h2 className="text-lg font-semibold mt-6">1. Eligibility for Returns</h2>
        <p>
          To be eligible for a return, your item must meet the following
          conditions:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>The item must be unused and in its original packaging.</li>
          <li>
            The return request must be made within{" "}
            <strong>7 days of delivery</strong>.
          </li>
          <li>
            Certain items (like perishables, personal care products, or custom
            orders) may not be eligible for return.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">2. Return Process</h2>
        <p>
          To start a return, please email us at{" "}
          <a
            href="mailto:support@ecom.com"
            className="text-primary hover:underline"
          >
            support@ecom.com
          </a>{" "}
          with your order ID, reason for return, and relevant photos if
          applicable. Once your request is reviewed, our team will provide
          instructions for sending the item back.
        </p>

        <h2 className="text-lg font-semibold mt-6">3. Refunds</h2>
        <p>
          Once we receive and inspect your returned item, we’ll notify you of
          the approval or rejection of your refund.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Approved refunds will be processed within{" "}
            <strong>5–7 business days</strong> to your original payment method.
          </li>
          <li>
            Shipping charges are non-refundable unless the return is due to our
            error (e.g., wrong or defective item).
          </li>
          <li>
            In some cases, only partial refunds are granted (e.g., damaged or
            used products).
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">4. Exchanges</h2>
        <p>
          We currently allow exchanges for defective or damaged items only. If
          you need an exchange, email us at{" "}
          <a
            href="mailto:support@ecom.com"
            className="text-primary hover:underline"
          >
            support@ecom.com
          </a>{" "}
          with your order details, and we’ll arrange a replacement.
        </p>

        <h2 className="text-lg font-semibold mt-6">5. Non-Returnable Items</h2>
        <p>
          The following items are <strong>non-returnable</strong>:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Gift cards and downloadable digital products</li>
          <li>Personal care or hygiene-related items</li>
          <li>Customized or made-to-order products</li>
          <li>Clearance or final sale items</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">6. Late or Missing Refunds</h2>
        <p>
          If you haven’t received a refund yet:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Check your bank account or credit card statement.</li>
          <li>Contact your bank — processing times can vary.</li>
          <li>
            If you’ve done all this and still haven’t received your refund,
            please contact us at{" "}
            <a
              href="mailto:support@ecom.com"
              className="text-primary hover:underline"
            >
              support@ecom.com
            </a>
            .
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">7. Contact Us</h2>
        <p>
          For any questions about returns or refunds, please contact:
          <br />
          📧{" "}
          <a
            href="mailto:support@ecom.com"
            className="text-primary hover:underline"
          >
            support@ecom.com
          </a>
        </p>
      </section>
    </div>
    </ClientLayout>
  );
}
