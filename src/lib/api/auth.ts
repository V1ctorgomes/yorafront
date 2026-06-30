import { getApiUrl } from "@/lib/env";
import {
  clearCustomerTokens,
  getCustomerAccessToken,
  getCustomerRefreshToken,
  setCustomerTokens,
} from "@/lib/auth";
import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  UserProfile,
} from "@/types";

class AuthApiError extends Error {
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
  throw new AuthApiError(message, response.status);
}

function customerHeaders(includeAuth = true) {
  const token = getCustomerAccessToken();

  return {
    "Content-Type": "application/json",
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function registerCustomer(payload: {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${getApiUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  const data = (await response.json()) as AuthResponse;
  setCustomerTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${getApiUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    await parseError(response);
  }

  const data = (await response.json()) as AuthResponse;
  setCustomerTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refreshCustomerSession(): Promise<AuthResponse | null> {
  const refreshToken = getCustomerRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${getApiUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearCustomerTokens();
    return null;
  }

  const data = (await response.json()) as AuthResponse;
  setCustomerTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logoutCustomer(): Promise<void> {
  const refreshToken = getCustomerRefreshToken();

  try {
    await fetch(`${getApiUrl()}/auth/logout`, {
      method: "POST",
      headers: customerHeaders(),
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearCustomerTokens();
  }
}

export async function fetchCustomerProfile(): Promise<UserProfile> {
  const response = await fetch(`${getApiUrl()}/auth/me`, {
    headers: customerHeaders(),
    cache: "no-store",
  });

  if (response.status === 401) {
    const refreshed = await refreshCustomerSession();
    if (refreshed) {
      return fetchCustomerProfile();
    }
  }

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function updateCustomerProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const response = await fetch(`${getApiUrl()}/auth/profile`, {
    method: "PATCH",
    headers: customerHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function changeCustomerPassword(
  payload: ChangePasswordPayload,
): Promise<{ message: string }> {
  const response = await fetch(`${getApiUrl()}/auth/change-password`, {
    method: "PATCH",
    headers: customerHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<{ message: string }>;
}

export async function forgotCustomerPassword(
  payload: ForgotPasswordPayload,
): Promise<{ message: string }> {
  const response = await fetch(`${getApiUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<{ message: string }>;
}

export async function resetCustomerPassword(
  payload: ResetPasswordPayload,
): Promise<{ message: string }> {
  const response = await fetch(`${getApiUrl()}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await parseError(response);
  }

  return response.json() as Promise<{ message: string }>;
}

export { AuthApiError };
