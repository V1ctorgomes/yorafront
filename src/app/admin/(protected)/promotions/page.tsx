"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deletePromotion, fetchAdminPromotions } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { AdminPromotion } from "@/types";

function formatPromotionType(promotion: AdminPromotion) {
  switch (promotion.type) {
    case "PERCENTAGE":
      return `${Number(promotion.value)}%`;
    case "FIXED":
      return formatPrice(Number(promotion.value));
    case "FREE_SHIPPING":
      return "Frete grátis";
    default:
      return promotion.type;
  }
}

function formatValidity(promotion: AdminPromotion) {
  const start = new Date(promotion.startDate).toLocaleDateString("pt-BR");
  const end = promotion.endDate
    ? new Date(promotion.endDate).toLocaleDateString("pt-BR")
    : "Sem fim";
  return `${start} — ${end}`;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPromotions() {
    setLoading(true);
    try {
      const data = await fetchAdminPromotions();
      setPromotions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPromotions();
  }, []);

  async function handleDelete(promotion: AdminPromotion) {
    const confirmed = window.confirm(
      `Deseja excluir a promoção "${promotion.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setDeletingId(promotion.id);
    try {
      await deletePromotion(promotion.id);
      setPromotions((current) =>
        current.filter((item) => item.id !== promotion.id),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">Promoções</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie cupons e campanhas promocionais.
          </p>
        </div>
        <Button href="/admin/promotions/new" size="sm">
          Nova promoção
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : promotions.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">Nenhuma promoção cadastrada.</p>
          <Button href="/admin/promotions/new" className="mt-4" size="sm">
            Criar primeira promoção
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Ativa</th>
                <th className="px-4 py-3 font-medium">Validade</th>
                <th className="px-4 py-3 font-medium">Utilizações</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr
                  key={promotion.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">{promotion.name}</td>
                  <td className="px-4 py-3">
                    {promotion.code ?? (
                      <span className="text-yora-muted">Automática</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {promotion.applicationType === "COUPON"
                      ? "Cupom"
                      : "Automática"}
                  </td>
                  <td className="px-4 py-3">{formatPromotionType(promotion)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        promotion.isActive ? "text-green-700" : "text-yora-muted"
                      }
                    >
                      {promotion.isActive ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {formatValidity(promotion)}
                  </td>
                  <td className="px-4 py-3">
                    {promotion.usageCount}
                    {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/promotions/${promotion.id}/edit`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(promotion)}
                        disabled={deletingId === promotion.id}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
