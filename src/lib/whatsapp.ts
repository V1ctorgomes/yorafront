import { formatPrice } from "@/lib/utils";
import { getSiteUrl } from "./env";

export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();

  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function buildWhatsAppUrl(message: string): string | null {
  const number = getWhatsAppNumber();

  if (!number) {
    return null;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(params: {
  productName: string;
  slug: string;
  color?: string;
  size?: string;
  price: number;
}): string {
  const lines = [
    "Olá! Tenho interesse em comprar:",
    "",
    `*${params.productName}*`,
  ];

  if (params.color) {
    lines.push(`Cor: ${params.color}`);
  }

  if (params.size) {
    lines.push(`Tamanho: ${params.size}`);
  }

  lines.push(`Valor: ${formatPrice(params.price)}`);
  lines.push("");
  lines.push(`${getSiteUrl()}/produto/${params.slug}`);

  return lines.join("\n");
}
