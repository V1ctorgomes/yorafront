import { getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/env";
import type {
  AdminBanner,
  AdminCategory,
  AdminCollection,
  AdminProduct,
  AuthResponse,
  BannerFormData,
  CategoryFormData,
  CollectionFormData,
  ProductFormData,
  ProductImage,
  ProductVariant,
  VariantFormData,
  ImageFormData,
  AdminOrderDetail,
  AdminOrderStatus,
  AdminOrdersDashboard,
  AdminOrdersQuery,
  AdminOrdersResponse,
  AdminPaymentsQuery,
  AdminPaymentsResponse,
  AdminShippingMethod,
  Payment,
} from "@/types";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError("Não autenticado", 401);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : "Erro na requisição";
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${getApiUrl()}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new ApiError("Credenciais inválidas", response.status);
  }

  return response.json();
}

export function fetchAdminBanners() {
  return adminFetch<AdminBanner[]>("/admin/banners");
}

export function fetchAdminBanner(id: string) {
  return adminFetch<AdminBanner>(`/admin/banners/${id}`);
}

export function createBanner(data: {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder?: number;
  isActive?: boolean;
}) {
  return adminFetch<AdminBanner>("/admin/banners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateBanner(id: string, data: Partial<BannerFormData>) {
  return adminFetch<AdminBanner>(`/admin/banners/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteBanner(id: string) {
  return adminFetch<{ message: string }>(`/admin/banners/${id}`, {
    method: "DELETE",
  });
}

export function fetchAdminCategories() {
  return adminFetch<AdminCategory[]>("/admin/categories");
}

export function fetchAdminCategory(id: string) {
  return adminFetch<AdminCategory>(`/admin/categories/${id}`);
}

export function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}) {
  return adminFetch<AdminCategory>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(id: string, data: Partial<CategoryFormData>) {
  return adminFetch<AdminCategory>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id: string) {
  return adminFetch<{ message: string }>(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export function fetchAdminProducts() {
  return adminFetch<AdminProduct[]>("/admin/products");
}

export function fetchAdminProduct(id: string) {
  return adminFetch<AdminProduct>(`/admin/products/${id}`);
}

export function createProduct(data: {
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  collectionId?: string | null;
  basePrice: number;
  coverImage: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isActive?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}) {
  return adminFetch<AdminProduct>("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProduct(
  id: string,
  data: Partial<Omit<ProductFormData, "collectionId">> & {
    collectionId?: string | null;
  },
) {
  return adminFetch<AdminProduct>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProduct(id: string) {
  return adminFetch<{ message: string }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export function fetchAdminCollections() {
  return adminFetch<AdminCollection[]>("/admin/collections");
}

export function fetchAdminCollection(id: string) {
  return adminFetch<AdminCollection>(`/admin/collections/${id}`);
}

export function createCollection(data: {
  name: string;
  slug?: string;
  description?: string;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}) {
  return adminFetch<AdminCollection>("/admin/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCollection(
  id: string,
  data: Partial<CollectionFormData> & {
    launchDate?: string;
    endDate?: string | null;
    bannerImageUrl?: string;
    thumbnailImageUrl?: string;
  },
) {
  return adminFetch<AdminCollection>(`/admin/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCollection(id: string) {
  return adminFetch<{ message: string }>(`/admin/collections/${id}`, {
    method: "DELETE",
  });
}

export function fetchAdminProductVariants(productId: string) {
  return adminFetch<ProductVariant[]>(`/admin/products/${productId}/variants`);
}

export function createProductVariant(
  productId: string,
  data: {
    color: string;
    size: string;
    sku: string;
    priceOverride?: number;
    stock: number;
    isActive?: boolean;
  },
) {
  return adminFetch<ProductVariant>(`/admin/products/${productId}/variants`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProductVariant(
  id: string,
  data: {
    color?: string;
    size?: string;
    sku?: string;
    priceOverride?: number | null;
    stock?: number;
    isActive?: boolean;
  },
) {
  return adminFetch<ProductVariant>(`/admin/variants/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProductVariant(id: string) {
  return adminFetch<{ message: string }>(`/admin/variants/${id}`, {
    method: "DELETE",
  });
}

export function fetchAdminProductImages(productId: string) {
  return adminFetch<ProductImage[]>(`/admin/products/${productId}/images`);
}

export function createProductImage(
  productId: string,
  data: {
    imageUrl: string;
    altText?: string;
    displayOrder?: number;
    color?: string | null;
  },
) {
  return adminFetch<ProductImage>(`/admin/products/${productId}/images`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProductImage(
  id: string,
  data: Partial<ImageFormData>,
) {
  return adminFetch<ProductImage>(`/admin/images/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteProductImage(id: string) {
  return adminFetch<{ message: string }>(`/admin/images/${id}`, {
    method: "DELETE",
  });
}

function buildOrdersQuery(params: AdminOrdersQuery = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function fetchAdminOrdersDashboard() {
  return adminFetch<AdminOrdersDashboard>("/admin/orders/dashboard");
}

export function fetchAdminOrders(params: AdminOrdersQuery = {}) {
  return adminFetch<AdminOrdersResponse>(
    `/admin/orders${buildOrdersQuery(params)}`,
  );
}

export function fetchAdminOrder(id: string) {
  return adminFetch<AdminOrderDetail>(`/admin/orders/${id}`);
}

export function updateAdminOrderStatus(
  id: string,
  status: AdminOrderStatus,
) {
  return adminFetch<AdminOrderDetail>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateAdminOrderTracking(
  id: string,
  trackingCode: string | null,
) {
  return adminFetch<AdminOrderDetail>(`/admin/orders/${id}/tracking`, {
    method: "PATCH",
    body: JSON.stringify({ trackingCode }),
  });
}

export function fetchAdminShippingMethods() {
  return adminFetch<AdminShippingMethod[]>("/admin/shipping-methods");
}

export function updateAdminShippingMethod(
  id: string,
  data: Partial<Pick<AdminShippingMethod, "isActive" | "displayOrder">>,
) {
  return adminFetch<AdminShippingMethod>(`/admin/shipping-methods/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

function buildPaymentsQuery(params: AdminPaymentsQuery) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function fetchAdminPayments(params: AdminPaymentsQuery = {}) {
  return adminFetch<AdminPaymentsResponse>(
    `/admin/payments${buildPaymentsQuery(params)}`,
  );
}

export function fetchAdminPayment(id: string) {
  return adminFetch<Payment & { rawResponse?: unknown }>(`/admin/payments/${id}`);
}

export { ApiError };
