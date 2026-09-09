import { billingJson, handleBillingError, optionalString, requireSiteSessionToken } from "@/app/api/billing/_shared";
import { requestSiteAuthJson } from "@/lib/site-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNo: string }> },
) {
  const { orderNo } = await params;
  const normalizedOrderNo = optionalString(orderNo);
  if (!normalizedOrderNo) {
    return billingJson({ ok: false, error: { code: "tokendance_recharge_order_missing", message: "Order is missing." } }, 400);
  }
  try {
    return billingJson(
      await requestSiteAuthJson(
        `/v1/integrations/tokendance/managed/recharge/orders/${encodeURIComponent(normalizedOrderNo)}`,
        { token: await requireSiteSessionToken() },
      ),
    );
  } catch (error) {
    return handleBillingError(error);
  }
}
