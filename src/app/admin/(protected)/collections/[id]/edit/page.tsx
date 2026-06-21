"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  CollectionForm,
  collectionToFormData,
  formDataToCollectionPayload,
} from "@/components/admin/CollectionForm";
import { fetchAdminCollection, updateCollection } from "@/lib/api/admin";
import type { CollectionFormData } from "@/types";

export default function EditCollectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<CollectionFormData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdminCollection(params.id)
      .then((collection) => setForm(collectionToFormData(collection)))
      .catch(() => setError("Coleção não encontrada."));
  }, [params.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;

    setError("");
    setLoading(true);

    try {
      await updateCollection(params.id, formDataToCollectionPayload(form));
      router.push("/admin/collections");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar coleção.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!form && !error) {
    return <p className="text-sm text-yora-muted">Carregando...</p>;
  }

  if (!form) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">
        Editar coleção
      </h1>
      <p className="mt-1 text-sm text-yora-muted">
        Atualize as informações da coleção selecionada.
      </p>

      <CollectionForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Salvar alterações"}
        error={error}
        disabled={loading}
        slugEditable
      />
    </div>
  );
}
