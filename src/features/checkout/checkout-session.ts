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
