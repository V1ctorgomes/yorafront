import { PaymentFlow } from "@/features/payment/PaymentFlow";

interface PaymentPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { orderNumber } = await params;

  return <PaymentFlow orderNumber={orderNumber} />;
}
