const GUEST_MODE_KEY = "yora_checkout_guest";

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

const PENDING_ORDERS_KEY = "yora_pending_payment_orders";

export function rememberPendingPaymentOrder(orderNumber: string) {
  if (typeof window === "undefined") return;

  const current = getPendingPaymentOrders().filter(
    (item) => item !== orderNumber,
  );
  current.unshift(orderNumber);
  sessionStorage.setItem(
    PENDING_ORDERS_KEY,
    JSON.stringify(current.slice(0, 5)),
  );
}

export function getPendingPaymentOrders() {
  if (typeof window === "undefined") return [];

  try {
    const raw = sessionStorage.getItem(PENDING_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function clearPendingPaymentOrder(orderNumber: string) {
  if (typeof window === "undefined") return;

  const current = getPendingPaymentOrders().filter(
    (item) => item !== orderNumber,
  );
  sessionStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(current));
}
