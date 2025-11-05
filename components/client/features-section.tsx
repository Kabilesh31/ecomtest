import { Card } from "@/components/ui/card"
import { Truck, Shield, RotateCcw, Headphones } from "lucide-react"

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50. Fast and reliable delivery to your doorstep.",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure transactions with encrypted payment processing.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day return policy. No questions asked, hassle-free returns.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer support team ready to help anytime.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose Us</h2>
          <p className="text-muted-foreground mt-2">Premium quality with exceptional service</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
