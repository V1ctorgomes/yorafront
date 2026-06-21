"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBanner } from "@/lib/api/admin";
import { BannerForm } from "@/components/admin/BannerForm";
import type { BannerFormData } from "@/types";

const initialData: BannerFormData = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  buttonText: "",
  buttonLink: "",
  displayOrder: 0,
  isActive: true,
};

export default function NewBannerPage() {
  const router = useRouter();
  const [form, setForm] = useState<BannerFormData>(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createBanner({
        title: form.title,
        subtitle: form.subtitle || undefined,
        imageUrl: form.imageUrl,
        mobileImageUrl: form.mobileImageUrl || undefined,
        buttonText: form.buttonText || undefined,
        buttonLink: form.buttonLink || undefined,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      });
      router.push("/admin/banners");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar banner.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-yora-charcoal">Novo banner</h1>
      <p className="mt-1 text-sm text-yora-muted">
        Preencha os campos para cadastrar um novo banner na Home.
      </p>

      <BannerForm
        form={form}
        onChange={setForm}
        onSubmit={handleSubmit}
        submitLabel={loading ? "Salvando..." : "Criar banner"}
        error={error}
        disabled={loading}
      />
    </div>
  );
}
