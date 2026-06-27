import { getApiUrl } from "@/lib/env";
import { getCustomerAccessToken } from "@/lib/auth";
import { refreshCustomerSession } from "@/lib/api/auth";
import type {
  AccountOverview,
  ChangePasswordPayload,
  CustomerAddress,
  CustomerAddressPayload,
  CustomerOrderDetail,
  CustomerOrdersResponse,
  UpdateProfilePayload,
  UserProfile,
} from "@/types";

class MeApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => ({}));
  const message =
    typeof body.message === "string"
      ? body.message
      : Array.isArray(body.message)
        ? body.message.join(", ")
        : "Erro na requisição";
  throw new MeApiError(message, response.status);
}

function meHeaders() {
  const token = getCustomerAccessToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function meFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      ...meHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshCustomerSession();
    if (refreshed) {
      return meFetch(path, options);
    }
  }

  if (!response.ok) {
    await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function fetchAccountOverview() {
  return meFetch<AccountOverview>("/me");
}

export function updateAccountProfile(payload: UpdateProfilePayload) {
  return meFetch<UserProfile>("/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changeAccountPassword(payload: ChangePasswordPayload) {
  return meFetch<{ message: string }>("/me/change-password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchCustomerAddresses() {
  return meFetch<CustomerAddress[]>("/me/addresses");
}

export function createCustomerAddress(payload: CustomerAddressPayload) {
  return meFetch<CustomerAddress>("/me/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCustomerAddress(
  id: string,
  payload: Partial<CustomerAddressPayload>,
) {
  return meFetch<CustomerAddress>(`/me/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCustomerAddress(id: string) {
  return meFetch<{ message: string }>(`/me/addresses/${id}`, {
    method: "DELETE",
  });
}

function buildOrdersQuery(params: {
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function fetchCustomerOrders(params: {
  search?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
} = {}) {
  return meFetch<CustomerOrdersResponse>(
    `/me/orders${buildOrdersQuery(params)}`,
  );
}

export function fetchCustomerOrder(orderNumber: string) {
  return meFetch<CustomerOrderDetail>(`/me/orders/${orderNumber}`);
}

export { MeApiError };
