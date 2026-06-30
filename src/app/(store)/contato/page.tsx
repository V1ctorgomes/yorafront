import { InfoPage } from "@/components/store/InfoPage";
import { storeInfoPages } from "@/content/store-info-pages";

export default function ContatoPage() {
  return <InfoPage {...storeInfoPages.contato} />;
}
