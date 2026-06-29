interface SalePricingProduct {
  isOnSale?: boolean;
  basePrice: number;
  compareAtPrice?: number | null;
}

export function hasSalePricing(product: SalePricingProduct) {
  return Boolean(
    product.isOnSale &&
      product.compareAtPrice &&
      product.compareAtPrice > product.basePrice,
  );
}

export function getSaleDiscountPercent(
  compareAtPrice: number,
  salePrice: number,
) {
  if (compareAtPrice <= salePrice) {
    return 0;
  }

  return Math.round(((compareAtPrice - salePrice) / compareAtPrice) * 100);
}
