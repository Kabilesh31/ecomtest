import { ClientLayout } from "@/components/client/client-layout"
import { HeroSection } from "@/components/client/hero-section"
import { ProductShowcase } from "@/components/client/product-showcase"
import { FeaturesSection } from "@/components/client/features-section"

export default function Home() {
  return (
    <ClientLayout>
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
    </ClientLayout>
  )
}
