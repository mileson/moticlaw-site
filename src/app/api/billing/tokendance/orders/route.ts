import {
  billingJson,
  handleBillingError,
  optionalString,
  readBillingBody,
  requireBillingSameOrigin,
  requireSiteSessionToken,
} from "@/app/api/billing/_shared";
import { requestSiteAuthJson } from "@/lib/site-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return billingJson(
      await requestSiteAuthJson("/v1/integrations/tokendance/managed/recharge/orders?limit=20", {
        token: await requireSiteSessionToken(),
      }),
    );
  } catch (error) {
    return handleBillingError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireBillingSameOrigin(request);
    const body = await readBillingBody(request);
    return billingJson(
      await requestSiteAuthJson("/v1/integrations/tokendance/managed/recharge/orders", {
        method: "POST",
        token: await requireSiteSessionToken(),
        body: {
          quote_id: optionalString(body.quoteId ?? body.quote_id) || "",
          client_idempotency_key: optionalString(body.clientIdempotencyKey ?? body.client_idempotency_key) || "",
        },
      }),
    );
  } catch (error) {
    return handleBillingError(error);
  }
}
