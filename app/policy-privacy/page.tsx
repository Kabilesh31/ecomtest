"use client";

import { ClientLayout } from "@/components/client/client-layout"

export default function PrivacyPolicyPage() {
  return (
    <ClientLayout>
    <div className="max-w-4xl mx-auto p-6 text-foreground">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8 text-center">
        Last Updated: November 7, 2025
      </p>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          Your privacy is very important to us. This Privacy Policy explains how
          we collect, use, and safeguard your personal information when you visit
          our website or make a purchase from our online store.
        </p>

        <h2 className="text-lg font-semibold mt-6">1. Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Personal Information:</strong> Name, email, phone number,
            billing/shipping address, and payment details.
          </li>
          <li>
            <strong>Non-Personal Information:</strong> Browser type, IP address,
            and browsing behavior for analytics and improvements.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To process, confirm, and deliver your orders.</li>
          <li>To send order confirmations, invoices, and updates.</li>
          <li>To provide customer support and handle inquiries.</li>
          <li>To improve our website, products, and overall experience.</li>
          <li>To send promotional emails if you’ve opted in.</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6">3. Sharing of Information</h2>
        <p>
          We do not sell or rent your personal data. We only share information with
          trusted partners such as payment gateways, logistics providers, or as
          required by law.
        </p>

        <h2 className="text-lg font-semibold mt-6">4. Data Security</h2>
        <p>
          We implement secure encryption and data protection practices to safeguard
          your information. However, no system is completely immune to threats—please
          use strong passwords and keep your account credentials private.
        </p>

        <h2 className="text-lg font-semibold mt-6">5. Cookies and Tracking</h2>
        <p>
          We use cookies to enhance your browsing experience, remember preferences,
          and analyze traffic. You can manage or disable cookies in your browser
          settings at any time.
        </p>

        <h2 className="text-lg font-semibold mt-6">6. Your Rights</h2>
        <p>
          You can request to access, update, or delete your personal information.
          For any data-related requests, please contact us at{" "}
          <a
            href="mailto:support@ecom.com"
            className="text-primary hover:underline"
          >
            support@ecom.com
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold mt-6">7. Third-Party Services</h2>
        <p>
          Our site may include links to third-party websites. We are not responsible
          for their privacy practices, so please review their policies separately.
        </p>

        <h2 className="text-lg font-semibold mt-6">8. Updates to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest version
          will always be available on this page, with the effective date listed at
          the top.
        </p>

        <h2 className="text-lg font-semibold mt-6">9. Contact Us</h2>
        <p>
          For any privacy-related questions or concerns, please reach out:
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
