import type { CheckoutAddress, CustomerAddress } from "@/types";

export type AddressStepMode = "saved" | "new";

export function mapSavedAddressToCheckout(
  saved: CustomerAddress,
): CheckoutAddress {
  return {
    zipCode: saved.zipCode,
    street: saved.street,
    number: saved.number,
    complement: saved.complement ?? "",
    district: saved.district,
    city: saved.city,
    state: saved.state,
    country: saved.country,
  };
}

export function isCheckoutAddressComplete(address: CheckoutAddress) {
  return (
    address.zipCode.replace(/\D/g, "").length === 8 &&
    address.street.trim().length >= 2 &&
    address.number.trim().length >= 1 &&
    address.district.trim().length >= 2 &&
    address.city.trim().length >= 2 &&
    address.state.trim().length >= 2
  );
}

export function isAddressStepValid(
  loggedIn: boolean,
  address: CheckoutAddress,
  mode: AddressStepMode,
  selectedAddressId: string | null,
) {
  if (!loggedIn) {
    return isCheckoutAddressComplete(address);
  }

  if (mode === "saved") {
    return Boolean(selectedAddressId);
  }

  return isCheckoutAddressComplete(address);
}
