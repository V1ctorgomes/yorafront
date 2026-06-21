"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBanner, fetchAdminBanners } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import type { AdminBanner } from "@/types";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadBanners() {
    setLoading(true);
    try {
      const data = await fetchAdminBanners();
      setBanners(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  async function handleDelete(banner: AdminBanner) {
    const confirmed = window.confirm(
      `Deseja excluir o banner "${banner.title}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setDeletingId(banner.id);
    try {
      await deleteBanner(banner.id);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">Banners</h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie os banners exibidos na Home.
          </p>
        </div>
        <Button href="/admin/banners/new" size="sm">
          Novo banner
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : banners.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">Nenhum banner cadastrado.</p>
          <Button href="/admin/banners/new" className="mt-4" size="sm">
            Criar primeiro banner
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Imagem</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-24 overflow-hidden bg-yora-sand">
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">{banner.title}</td>
                  <td className="px-4 py-3">{banner.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        banner.isActive
                          ? "text-green-700"
                          : "text-yora-muted"
                      }
                    >
                      {banner.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {new Date(banner.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/banners/${banner.id}/edit`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(banner)}
                        disabled={deletingId === banner.id}
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
