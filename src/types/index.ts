export type ProductBadge = "new" | "sale" | "sold-out";

export interface ProductCategoryRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCollectionRef {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  displayOrder: number;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  sku: string;
  color: string;
  size: string;
  priceOverride: number | null;
  price: number;
  stock: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  basePrice: number;
  isNew: boolean;
  isFeatured: boolean;
  category: ProductCategoryRef;
  description?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  images?: ProductImage[];
}

export interface AdminProduct extends Product {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  collection?: ProductCollectionRef | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate: string | null;
  isFeatured: boolean;
}

export interface CollectionDetail extends Collection {
  productCount: number;
  products: Product[];
}

export interface AdminCollection extends Collection {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  displayOrder: number;
}

export interface AdminBanner extends Banner {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface AdminCategory extends Category {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface NavItem {
  label: string;
  href: string;
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  buttonText: string;
  buttonLink: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductFormData {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  collectionId: string;
  basePrice: number;
  coverImage: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  launchDate: string;
  endDate: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface VariantFormData {
  color: string;
  size: string;
  sku: string;
  priceOverride: string;
  stock: number;
  isActive: boolean;
}

export interface ImageFormData {
  imageUrl: string;
  altText: string;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  productVariantId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxStock?: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
}

export type ShippingMethod = "pac" | "sedex" | "pickup";

export interface ShippingQuote {
  shippingMethodId: string;
  provider: string;
  service: string;
  serviceCode: string;
  price: number;
  deadline: number;
}

export interface AdminShippingMethod {
  id: string;
  name: string;
  provider: string;
  serviceCode: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatusValue =
  | "PENDING"
  | "WAITING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country?: string;
}

export interface CheckoutPayload {
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  shippingMethodId: string;
}

export interface OrderAddress {
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productVariantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderNumber: string;
  status: string;
  customer: CheckoutCustomer;
  shippingMethod: ShippingMethod;
  shippingMethodId?: string | null;
  shippingProvider?: string | null;
  shippingService?: string | null;
  shippingLabel: string;
  shippingDeadlineDays?: number | null;
  trackingCode?: string | null;
  subtotal: number;
  shippingPrice: number;
  discount: number;
  total: number;
  paymentExpiresAt: string;
  createdAt: string;
  items: OrderItem[];
  address: OrderAddress | null;
}

export type AdminOrderStatus = OrderStatusValue;

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: AdminOrderStatus;
  itemCount: number;
  total: number;
  shippingMethod: ShippingMethod;
  shippingLabel: string;
  createdAt: string;
}

export interface AdminOrdersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOrdersResponse {
  data: AdminOrderListItem[];
  meta: AdminOrdersMeta;
}

export interface AdminOrdersDashboard {
  counts: {
    waitingPayment: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    averageTicket: number;
  };
}

export interface AdminOrderStatusHistoryEntry {
  id: string;
  previousStatus: AdminOrderStatus | null;
  newStatus: AdminOrderStatus;
  adminEmail: string;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: AdminOrderStatus;
  allowedStatuses: AdminOrderStatus[];
  customer: CheckoutCustomer;
  shippingMethod: ShippingMethod;
  shippingLabel: string;
  shippingProvider?: string | null;
  shippingService?: string | null;
  shippingDeadlineDays?: number | null;
  trackingCode?: string | null;
  subtotal: number;
  shippingPrice: number;
  discount: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  items: Array<
    OrderItem & {
      id: string;
      color: string | null;
      size: string | null;
      imageUrl: string | null;
    }
  >;
  address: OrderAddress | null;
  statusHistory: AdminOrderStatusHistoryEntry[];
}

export interface AdminOrdersQuery {
  search?: string;
  status?: AdminOrderStatus;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: string;
  maxTotal?: string;
  shippingMethod?: ShippingMethod;
  sort?: "newest" | "oldest" | "highest" | "lowest";
  page?: number;
  limit?: number;
}

export interface ShippingOption {
  shippingMethodId: string;
  provider: string;
  service: string;
  serviceCode: string;
  label: string;
  price: number;
  deadline: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: UserProfile;
  admin?: {
    id: string;
    email: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "CUSTOMER";
  emailVerified: boolean;
  birthDate: string | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  birthDate?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  isGuest: boolean;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerAddress {
  id: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddressPayload {
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  country?: string;
  isPrimary?: boolean;
}

export interface CustomerOrderListItem {
  orderNumber: string;
  status: OrderStatusValue;
  total: number;
  itemCount: number;
  createdAt: string;
  shippingLabel: string;
}

export interface CustomerOrderDetail {
  orderNumber: string;
  status: OrderStatusValue;
  shippingMethod: ShippingMethod;
  shippingLabel: string;
  shippingProvider?: string | null;
  shippingService?: string | null;
  shippingDeadlineDays?: number | null;
  trackingCode?: string | null;
  subtotal: number;
  shippingPrice: number;
  discount: number;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    sku: string;
    color: string | null;
    size: string | null;
    imageUrl: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  address: OrderAddress | null;
}

export interface AccountOverview {
  profile: UserProfile;
  dashboard: {
    totalOrders: number;
    addressCount: number;
    lastOrder: {
      orderNumber: string;
      status: OrderStatusValue;
      total: number;
      itemCount: number;
      createdAt: string;
    } | null;
  };
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerOrdersResponse {
  data: CustomerOrderListItem[];
  meta: PaginatedMeta;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export type PaymentMethodType = "PIX" | "CREDIT_CARD";

export type PaymentStatusValue =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentPixData {
  qrCode: string | null;
  qrCodeBase64: string | null;
  copyPaste: string;
  expiresAt: string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatusValue;
  provider: "MERCADO_PAGO";
  providerPaymentId: string | null;
  paymentMethod: PaymentMethodType;
  amount: number;
  status: PaymentStatusValue;
  installments: number | null;
  pix: PaymentPixData | null;
  createdAt: string;
  updatedAt: string;
  rawResponse?: unknown;
}

export interface PaymentConfig {
  publicKey: string;
  environment: string;
  enabled: boolean;
}

export interface CreatePaymentPayload {
  orderNumber: string;
  paymentMethod: PaymentMethodType;
  token?: string;
  paymentMethodId?: string;
  installments?: number;
  issuerId?: string;
}

export interface AdminPaymentsQuery {
  search?: string;
  status?: PaymentStatusValue;
  page?: number;
  limit?: number;
}

export interface AdminPaymentsResponse {
  data: Payment[];
  meta: PaginatedMeta;
}
