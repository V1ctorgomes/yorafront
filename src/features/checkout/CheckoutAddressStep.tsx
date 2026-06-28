"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  inputClassName,
  labelClassName,
} from "@/features/checkout/constants";
import {
  type AddressStepMode,
  isCheckoutAddressComplete,
  mapSavedAddressToCheckout,
} from "@/features/checkout/checkout-address-utils";
import { fetchCustomerAddresses } from "@/lib/api/me";
import { cn } from "@/lib/utils";
import type { CheckoutAddress, CustomerAddress } from "@/types";

interface CheckoutAddressStepProps {
  loggedIn: boolean;
  address: CheckoutAddress;
  onAddressChange: (address: CheckoutAddress) => void;
  onModeChange: (mode: AddressStepMode) => void;
  onValidChange: (valid: boolean) => void;
}

export function CheckoutAddressStep({
  loggedIn,
  address,
  onAddressChange,
  onModeChange,
  onValidChange,
}: CheckoutAddressStepProps) {
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(loggedIn);
  const [mode, setMode] = useState<AddressStepMode>("saved");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!loggedIn) {
      onModeChange("new");
      return;
    }

    setLoading(true);
    fetchCustomerAddresses()
      .then((addresses) => {
        setSavedAddresses(addresses);

        if (addresses.length === 0) {
          setMode("new");
          onModeChange("new");
          setSelectedAddressId(null);
          return;
        }

        const primary =
          addresses.find((item) => item.isPrimary) ?? addresses[0];
        setMode("saved");
        onModeChange("saved");
        setSelectedAddressId(primary.id);
        onAddressChange(mapSavedAddressToCheckout(primary));
      })
      .catch(() => {
        setMode("new");
        onModeChange("new");
      })
      .finally(() => setLoading(false));
  }, [loggedIn, onAddressChange, onModeChange]);

  useEffect(() => {
    if (!loggedIn) {
      onValidChange(isCheckoutAddressComplete(address));
      return;
    }

    if (mode === "saved") {
      onValidChange(Boolean(selectedAddressId));
      return;
    }

    onValidChange(isCheckoutAddressComplete(address));
  }, [loggedIn, mode, selectedAddressId, address, onValidChange]);

  function switchToSaved() {
    const primary =
      savedAddresses.find((item) => item.isPrimary) ?? savedAddresses[0];

    if (!primary) return;

    setMode("saved");
    onModeChange("saved");
    setSelectedAddressId(primary.id);
    onAddressChange(mapSavedAddressToCheckout(primary));
  }

  function switchToNew() {
    setMode("new");
    onModeChange("new");
    setSelectedAddressId(null);
    onAddressChange({
      zipCode: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      country: "BR",
    });
  }

  function handleSelectSaved(saved: CustomerAddress) {
    setSelectedAddressId(saved.id);
    onAddressChange(mapSavedAddressToCheckout(saved));
  }

  if (loggedIn && loading) {
    return (
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-2xl text-yora-charcoal">
            Endereço de entrega
          </h2>
          <p className="mt-2 text-sm text-yora-muted">
            Carregando seus endereços...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-yora-charcoal">
          Endereço de entrega
        </h2>
        <p className="mt-2 text-sm text-yora-muted">
          {loggedIn
            ? "Escolha um endereço cadastrado ou adicione um novo."
            : "Informe o endereço para entrega deste pedido."}
        </p>
      </div>

      {loggedIn && savedAddresses.length > 0 && mode === "saved" && (
        <div className="space-y-3">
          {savedAddresses.map((saved) => (
            <label
              key={saved.id}
              className={cn(
                "flex cursor-pointer items-start gap-4 border p-4 transition-colors",
                selectedAddressId === saved.id
                  ? "border-yora-charcoal bg-yora-sand/40"
                  : "border-yora-charcoal/10 hover:border-yora-charcoal/30",
              )}
            >
              <input
                type="radio"
                name="savedAddress"
                checked={selectedAddressId === saved.id}
                onChange={() => handleSelectSaved(saved)}
                className="mt-1"
              />
              <span className="flex-1 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-yora-charcoal">
                    {saved.recipient}
                  </span>
                  {saved.isPrimary && (
                    <span className="text-xs tracking-widest text-yora-taupe uppercase">
                      Principal
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-yora-muted">
                  {saved.street}, {saved.number}
                  {saved.complement ? ` - ${saved.complement}` : ""}
                </span>
                <span className="block text-yora-muted">
                  {saved.district}, {saved.city} - {saved.state}
                </span>
                <span className="block text-yora-muted">
                  CEP {saved.zipCode}
                </span>
              </span>
            </label>
          ))}

          <Button type="button" variant="outline" onClick={switchToNew}>
            Cadastrar novo endereço
          </Button>
        </div>
      )}

      {(!loggedIn || mode === "new") && (
        <>
          {loggedIn && savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={switchToSaved}
              className="text-sm text-yora-muted underline-offset-4 hover:text-yora-charcoal hover:underline"
            >
              Usar endereço cadastrado
            </button>
          )}

          {loggedIn && (
            <p className="text-sm text-yora-muted">
              Este endereço será salvo na sua conta para próximas compras.
            </p>
          )}

          <CheckoutAddressForm address={address} onChange={onAddressChange} />

          {loggedIn && savedAddresses.length === 0 && (
            <p className="text-sm text-yora-muted">
              Você ainda não tem endereços cadastrados.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function CheckoutAddressForm({
  address,
  onChange,
}: {
  address: CheckoutAddress;
  onChange: (address: CheckoutAddress) => void;
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>CEP *</label>
          <input
            className={inputClassName}
            placeholder="00000-000"
            value={address.zipCode}
            onChange={(e) => onChange({ ...address, zipCode: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelClassName}>Número *</label>
          <input
            className={inputClassName}
            value={address.number}
            onChange={(e) => onChange({ ...address, number: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className={labelClassName}>Rua *</label>
        <input
          className={inputClassName}
          value={address.street}
          onChange={(e) => onChange({ ...address, street: e.target.value })}
          required
        />
      </div>
      <div>
        <label className={labelClassName}>Complemento</label>
        <input
          className={inputClassName}
          value={address.complement ?? ""}
          onChange={(e) =>
            onChange({ ...address, complement: e.target.value })
          }
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Bairro *</label>
          <input
            className={inputClassName}
            value={address.district}
            onChange={(e) => onChange({ ...address, district: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelClassName}>Cidade *</label>
          <input
            className={inputClassName}
            value={address.city}
            onChange={(e) => onChange({ ...address, city: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClassName}>Estado *</label>
          <input
            className={inputClassName}
            value={address.state}
            onChange={(e) => onChange({ ...address, state: e.target.value })}
            required
          />
        </div>
        <div>
          <label className={labelClassName}>País</label>
          <input
            className={inputClassName}
            value={address.country ?? "BR"}
            onChange={(e) => onChange({ ...address, country: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
