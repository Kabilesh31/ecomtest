import ProductDetails from "./ProductDetails";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }

    const product = await res.json();

    if (!product) {
      return (
        <div className="text-center text-gray-400 py-10">Product not found</div>
      );
    }

    return <ProductDetails product={product} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load product details.
      </div>
    );
  }
}
