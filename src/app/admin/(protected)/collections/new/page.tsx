"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  CollectionForm,
  formDataToCollectionPayload,
  initialCollectionFormData,
} from "@/components/admin/CollectionForm";
import { createCollection } from "@/lib/api/admin";
import type { CollectionFormData } from "@/types";

export default function NewCollectionPage() {
  const router = useRouter();
  const [form, setForm] = useState<CollectionFormData>(initialCollectionFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createCollection(formDataToCollectionPayload(form));
      router.push("/admin/collections");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar coleção.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">
        Nova coleção
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Cadastre um novo drop ou lançamento sazonal.
      </p>

      <CollectionForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar coleção"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
