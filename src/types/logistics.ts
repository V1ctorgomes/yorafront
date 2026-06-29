export type LogisticStatus =
  | "PENDING"
  | "LABEL_PENDING"
  | "LABEL_CREATED"
  | "POSTED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

export type MelhorEnvioEnvironment = "SANDBOX" | "PRODUCTION";

export interface MelhorEnvioConfig {
  clientId: string | null;
  hasClientSecret: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  environment: MelhorEnvioEnvironment;
  isConnected: boolean;
  tokenExpiresAt: string | null;
  updatedAt: string;
}

export interface ShippingSender {
  id: string;
  name: string;
  company: string | null;
  document: string;
  phone: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingPackage {
  id: string;
  name: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  maxWeightKg: number;
  packageWeightKg: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingEvent {
  id?: string;
  provider?: string;
  status: string;
  description: string;
  location?: string | null;
  eventDate: string;
}

export interface ExpeditionOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  shippingProvider: string | null;
  shippingService: string | null;
  logisticStatus: LogisticStatus | null;
  trackingCode: string | null;
  shippingLabelId: string | null;
  shippingLabelUrl: string | null;
  status: string;
  total: number;
  createdAt: string;
  lastEvent: {
    description: string;
    eventDate: string;
  } | null;
}

export interface ShippingLabel {
  orderId: string;
  labelId: string | null;
  labelUrl: string | null;
  trackingCode: string | null;
  logisticStatus: LogisticStatus | null;
}

export const LOGISTIC_STATUS_LABELS: Record<LogisticStatus, string> = {
  PENDING: "Pendente",
  LABEL_PENDING: "Aguardando etiqueta",
  LABEL_CREATED: "Etiqueta criada",
  POSTED: "Postado",
  IN_TRANSIT: "Em trânsito",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  FAILED: "Falha na entrega",
  RETURNED: "Devolvido",
  CANCELLED: "Cancelado",
};
