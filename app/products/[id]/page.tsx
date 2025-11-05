import ProductDetails from "./ProductDetails"

interface ProductPageProps {
  params: { id: string }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // ✅ Fetch product by ID from your API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`, {
      cache: "no-store", // always get fresh data
    })

    if (!res.ok) {
      throw new Error("Failed to fetch product")
    }

    const product = await res.json()

    // ✅ Handle missing product
    if (!product) {
      return <div className="text-center text-gray-400 py-10">Product not found</div>
    }

    // ✅ Pass data to ProductDetails (client component)
    return <ProductDetails product={product} />
  } catch (error) {
    console.error("Error fetching product:", error)
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load product details.
      </div>
    )
  }
}
