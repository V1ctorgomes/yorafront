"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteProduct, fetchAdminProducts } from "@/lib/api/admin";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import type { AdminProduct } from "@/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(
      `Deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
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
            Produtos
          </h1>
          <p className="mt-1 text-sm text-yora-muted">
            Gerencie o catálogo da loja.
          </p>
        </div>
        <Button href="/admin/products/new" size="sm">
          Novo produto
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-yora-muted">Carregando...</p>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-yora-charcoal/20 bg-yora-cream p-10 text-center">
          <p className="text-sm text-yora-muted">Nenhum produto cadastrado.</p>
          <Button href="/admin/products/new" className="mt-4" size="sm">
            Criar primeiro produto
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-yora-charcoal/10 bg-yora-cream">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-yora-charcoal/10 bg-yora-sand/50">
              <tr>
                <th className="px-4 py-3 font-medium">Imagem</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Preço</th>
                <th className="px-4 py-3 font-medium">Destaque</th>
                <th className="px-4 py-3 font-medium">Novo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-yora-charcoal/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-10 overflow-hidden bg-yora-sand">
                      <Image
                        src={product.coverImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3 text-yora-muted">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3">
                    {product.isFeatured ? "Sim" : "Não"}
                  </td>
                  <td className="px-4 py-3">{product.isNew ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        product.isActive ? "text-green-700" : "text-yora-muted"
                      }
                    >
                      {product.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yora-muted">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1 text-yora-charcoal hover:text-yora-taupe"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
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
