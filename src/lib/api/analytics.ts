import { getAuthToken } from "@/lib/auth";
import { getApiUrl } from "@/lib/env";
import type {
  AnalyticsDashboard,
  AnalyticsPeriodPreset,
} from "@/types/analytics";

class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

function buildQuery(params: {
  period?: AnalyticsPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params.period) searchParams.set("period", params.period);
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom);
  if (params.dateTo) searchParams.set("dateTo", params.dateTo);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function analyticsFetch<T>(path: string): Promise<T> {
  const token = getAuthToken();

  if (!token) {
    throw new AnalyticsApiError("Não autenticado", 401);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.message === "string"
        ? body.message
        : Array.isArray(body.message)
          ? body.message.join(", ")
          : "Erro ao carregar analytics";
    throw new AnalyticsApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export function fetchAnalyticsDashboard(params: {
  period?: AnalyticsPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
}) {
  return analyticsFetch<AnalyticsDashboard>(
    `/admin/analytics/dashboard${buildQuery(params)}`,
  );
}

export { AnalyticsApiError };
