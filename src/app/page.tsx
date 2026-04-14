import { headers } from "next/headers";
import { detectLocale } from "@/lib/locale";
import { MotiClawLanding } from "@/components/moticlaw-landing";

export default async function Home() {
  const requestHeaders = await headers();
  const locale = detectLocale(requestHeaders.get("accept-language"));
  return <MotiClawLanding initialLocale={locale} />;
}
