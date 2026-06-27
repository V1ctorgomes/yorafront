const ADMIN_ACCESS_KEY = "yora_admin_access";
const ADMIN_REFRESH_KEY = "yora_admin_refresh";
const CUSTOMER_ACCESS_KEY = "yora_customer_access";
const CUSTOMER_REFRESH_KEY = "yora_customer_refresh";

function getStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function setStorageItem(key: string, value: string) {
  localStorage.setItem(key, value);
}

function removeStorageItem(key: string) {
  localStorage.removeItem(key);
}

export function getAuthToken(): string | null {
  return getStorageItem(ADMIN_ACCESS_KEY);
}

export function getAdminRefreshToken(): string | null {
  return getStorageItem(ADMIN_REFRESH_KEY);
}

export function setAuthToken(accessToken: string, refreshToken?: string): void {
  setStorageItem(ADMIN_ACCESS_KEY, accessToken);
  if (refreshToken) {
    setStorageItem(ADMIN_REFRESH_KEY, refreshToken);
  }
}

export function clearAuthToken(): void {
  removeStorageItem(ADMIN_ACCESS_KEY);
  removeStorageItem(ADMIN_REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export function getCustomerAccessToken(): string | null {
  return getStorageItem(CUSTOMER_ACCESS_KEY);
}

export function getCustomerRefreshToken(): string | null {
  return getStorageItem(CUSTOMER_REFRESH_KEY);
}

export function setCustomerTokens(
  accessToken: string,
  refreshToken: string,
): void {
  setStorageItem(CUSTOMER_ACCESS_KEY, accessToken);
  setStorageItem(CUSTOMER_REFRESH_KEY, refreshToken);
}

export function clearCustomerTokens(): void {
  removeStorageItem(CUSTOMER_ACCESS_KEY);
  removeStorageItem(CUSTOMER_REFRESH_KEY);
}

export function isCustomerAuthenticated(): boolean {
  return Boolean(getCustomerAccessToken());
}

export function decodeJwtPayload<T extends Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as T;
  } catch {
    return null;
  }
}

export function isAdminToken(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  const payload = decodeJwtPayload<{ role?: string }>(token);
  return payload?.role === "ADMIN";
}
