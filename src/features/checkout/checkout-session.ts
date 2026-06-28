const GUEST_MODE_KEY = "yora_checkout_guest";
const PENDING_ORDERS_KEY = "yora_pending_payment_orders";
const LEGACY_PENDING_ORDERS_KEY = "yora_pending_payment_orders";

export function setCheckoutGuestMode() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GUEST_MODE_KEY, "1");
}

export function hasCheckoutGuestMode() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(GUEST_MODE_KEY) === "1";
}

export function clearCheckoutGuestMode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GUEST_MODE_KEY);
}

export function buildAuthRedirect(path: string, type: "login" | "cadastro") {
  return `/${type}?redirect=${encodeURIComponent(path)}`;
}

function readStoredOrders(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(PENDING_ORDERS_KEY);
    if (!raw) {
      const legacy = sessionStorage.getItem(LEGACY_PENDING_ORDERS_KEY);
      if (!legacy) return [];

      const parsed = JSON.parse(legacy) as unknown;
      const orders = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];

      if (orders.length > 0) {
        localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
        sessionStorage.removeItem(LEGACY_PENDING_ORDERS_KEY);
      }

      return orders;
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStoredOrders(orders: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
}

export function rememberPendingPaymentOrder(orderNumber: string) {
  const current = readStoredOrders().filter((item) => item !== orderNumber);
  current.unshift(orderNumber);
  writeStoredOrders(current.slice(0, 5));
}

export function getPendingPaymentOrders() {
  return readStoredOrders();
}

export function clearPendingPaymentOrder(orderNumber: string) {
  const current = readStoredOrders().filter((item) => item !== orderNumber);
  writeStoredOrders(current);
}

export function hasPendingPaymentOrders() {
  return readStoredOrders().length > 0;
}
