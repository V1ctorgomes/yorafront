"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteCategory, fetchAdminCategories } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import type { AdminCategory } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(
      `Deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
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
            Categorias
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Organize os produtos por grupos no site.
          </p>
        </div>
        <Button href="/admin/categories/new" size="sm">
          Nova categoria
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : categories.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">Nenhuma categoria cadastrada.</p>
          <Button href="/admin/categories/new" className="mt-4" size="sm">
            Criar primeira categoria
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Ordem</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Produtos</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">{category.name}</td>
                  <td className="px-4 py-3 text-yora-muted">{category.slug}</td>
                  <td className="px-4 py-3">{category.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        category.isActive ? "text-green-700" : "text-yora-muted"
                      }
                    >
                      {category.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {category._count?.products ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        disabled={deletingId === category.id}
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
