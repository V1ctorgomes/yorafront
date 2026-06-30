import { InfoPage } from "@/components/store/InfoPage";
import { storeInfoPages } from "@/content/store-info-pages";

export default function EntregaPage() {
  return <InfoPage {...storeInfoPages.entrega} />;
}
