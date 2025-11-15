"use client";
import { ClientLayout } from "@/components/client/client-layout"
import { HeroSection } from "@/components/client/hero-section"
import { ProductShowcase } from "@/components/client/product-showcase"
import { FeaturesSection } from "@/components/client/features-section"
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    const refreshFlag = sessionStorage.getItem("postLoginRefresh");
    if (refreshFlag) {
      sessionStorage.removeItem("postLoginRefresh");
      window.location.reload();
    }
  }, []);
  return (
    <ClientLayout>
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
    </ClientLayout>
  )
}
