import {
  billingJson,
  handleBillingError,
  readBillingBody,
  requireBillingSameOrigin,
  requireSiteSessionToken,
} from "@/app/api/billing/_shared";
import { requestSiteAuthJson } from "@/lib/site-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    requireBillingSameOrigin(request);
    const body = await readBillingBody(request);
    return billingJson(
      await requestSiteAuthJson("/v1/integrations/tokendance/managed/recharge/quote", {
        method: "POST",
        token: await requireSiteSessionToken(),
        body: { amount_cny: integerAmount(body.amountCny ?? body.amount_cny) },
      }),
    );
  } catch (error) {
    return handleBillingError(error);
  }
}

function integerAmount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : 0;
}
