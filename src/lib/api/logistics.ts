import { getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/env";
import type {
  ExpeditionOrder,
  MelhorEnvioConfig,
  MelhorEnvioEnvironment,
  ShippingEvent,
  ShippingLabel,
  ShippingPackage,
  ShippingSender,
} from "@/types/logistics";

class LogisticsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : "Erro na operação logística";
    throw new LogisticsApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchMelhorEnvioConfig() {
  return adminFetch<MelhorEnvioConfig>(
    "/admin/shipping/providers/melhor-envio",
  );
}

export function updateMelhorEnvioConfig(data: {
  clientId?: string;
  clientSecret?: string;
  environment?: MelhorEnvioEnvironment;
  isConnected?: boolean;
}) {
  return adminFetch<MelhorEnvioConfig>(
    "/admin/shipping/providers/melhor-envio",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function fetchMelhorEnvioOAuthUrl() {
  return adminFetch<{ url: string }>(
    "/admin/shipping/providers/melhor-envio/oauth-url",
  );
}

export function fetchShippingSenders() {
  return adminFetch<ShippingSender[]>("/admin/shipping/senders");
}

export function createShippingSender(
  data: Omit<ShippingSender, "id" | "createdAt" | "updatedAt">,
) {
  return adminFetch<ShippingSender>("/admin/shipping/senders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShippingSender(
  id: string,
  data: Partial<Omit<ShippingSender, "id" | "createdAt" | "updatedAt">>,
) {
  return adminFetch<ShippingSender>(`/admin/shipping/senders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteShippingSender(id: string) {
  return adminFetch<{ success: boolean }>(`/admin/shipping/senders/${id}`, {
    method: "DELETE",
  });
}

export function fetchShippingPackages() {
  return adminFetch<ShippingPackage[]>("/admin/shipping/packages");
}

export function createShippingPackage(
  data: Omit<ShippingPackage, "id" | "createdAt" | "updatedAt">,
) {
  return adminFetch<ShippingPackage>("/admin/shipping/packages", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateShippingPackage(
  id: string,
  data: Partial<Omit<ShippingPackage, "id" | "createdAt" | "updatedAt">>,
) {
  return adminFetch<ShippingPackage>(`/admin/shipping/packages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteShippingPackage(id: string) {
  return adminFetch<{ success: boolean }>(`/admin/shipping/packages/${id}`, {
    method: "DELETE",
  });
}

export function fetchExpeditionOrders(params: {
  search?: string;
  logisticStatus?: string;
  page?: number;
  limit?: number;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.logisticStatus) searchParams.set("logisticStatus", params.logisticStatus);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();

  return adminFetch<{
    data: ExpeditionOrder[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>(`/admin/expedition${query ? `?${query}` : ""}`);
}

export function fetchExpeditionHistory(orderId: string) {
  return adminFetch<ShippingEvent[]>(`/admin/expedition/${orderId}/history`);
}

export function syncExpeditionTracking(orderId: string) {
  return adminFetch(`/admin/expedition/${orderId}/sync-tracking`, {
    method: "POST",
  });
}

export function purchaseShippingLabel(orderId: string) {
  return adminFetch<ShippingLabel>("/shipping/labels", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export function cancelShippingLabel(orderId: string) {
  return adminFetch<ShippingLabel>(`/shipping/labels/${orderId}`, {
    method: "DELETE",
  });
}

export function printShippingLabel(orderId: string) {
  return adminFetch<{ url: string }>(`/shipping/labels/${orderId}/print`, {
    method: "POST",
  });
}

export function printShippingLabelsBatch(orderIds: string[]) {
  return adminFetch<{ url: string }>("/shipping/labels/batch/print", {
    method: "POST",
    body: JSON.stringify({ orderIds }),
  });
}

export { LogisticsApiError };
