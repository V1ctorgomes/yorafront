"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteCollection, fetchAdminCollections } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import type { AdminCollection } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCollections() {
    setLoading(true);
    try {
      const data = await fetchAdminCollections();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCollections();
  }, []);

  async function handleDelete(collection: AdminCollection) {
    const confirmed = window.confirm(
      `Deseja excluir a coleção "${collection.name}"? Os produtos serão desvinculados.`,
    );

    if (!confirmed) return;

    setDeletingId(collection.id);
    try {
      await deleteCollection(collection.id);
      setCollections((current) =>
        current.filter((item) => item.id !== collection.id),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-yora-charcoal">
            Coleções
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie drops e lançamentos sazonais.
          </p>
        </div>
        <Button href="/admin/collections/new" size="sm">
          Nova coleção
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : collections.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">Nenhuma coleção cadastrada.</p>
          <Button href="/admin/collections/new" className="mt-4" size="sm">
            Criar primeira coleção
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Banner</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Lançamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Destaque</th>
                <th className="px-4 py-3 font-medium">Produtos</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr
                  key={collection.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-20 overflow-hidden bg-yora-sand">
                      <Image
                        src={collection.thumbnailImageUrl}
                        alt={collection.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">{collection.name}</td>
                  <td className="px-4 py-3 text-yora-muted">{collection.slug}</td>
                  <td className="px-4 py-3 text-yora-muted">
                    {formatDate(collection.launchDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        collection.isActive
                          ? "text-green-700"
                          : "text-yora-muted"
                      }
                    >
                      {collection.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {collection.isFeatured ? "Sim" : "Não"}
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {collection._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/collections/${collection.id}/edit`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(collection)}
                        disabled={deletingId === collection.id}
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
