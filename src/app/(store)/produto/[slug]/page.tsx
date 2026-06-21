import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import {
  fetchProductBySlug,
  fetchProductVariants,
} from "@/lib/api/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, variants] = await Promise.all([
    fetchProductBySlug(slug),
    fetchProductVariants(slug),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} variants={variants} />;
}
