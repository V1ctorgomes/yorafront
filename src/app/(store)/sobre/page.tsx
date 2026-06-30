import { InfoPage } from "@/components/store/InfoPage";
import { storeInfoPages } from "@/content/store-info-pages";

export default function SobrePage() {
  return <InfoPage {...storeInfoPages.sobre} />;
}
