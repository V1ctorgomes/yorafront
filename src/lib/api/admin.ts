import { getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/env";
import type {
  AdminBanner,
  AuthResponse,
  BannerFormData,
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

export { ApiError };
