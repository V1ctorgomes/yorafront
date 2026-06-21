function normalizeBaseUrl(url: string): string {
  let normalized = url.trim().replace(/\/+$/, "");

  // Corrige env mal configurado: https://https://dominio...
  normalized = normalized.replace(
    /^(https?:\/\/)(https?:\/\/)+/i,
    (_match, protocol: string) => protocol,
  );

  return normalized;
}

export function getSiteUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  );
}

export function getApiUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  );
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
