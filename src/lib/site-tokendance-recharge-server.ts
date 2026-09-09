import { cookies } from "next/headers";
import {
  readSiteAuthSession,
  requestSiteAuthJson,
  siteSessionCookieName,
  type SiteAuthSession,
} from "@/lib/site-auth";
import {
  normalizeTokenDanceRechargeAccount,
  normalizeTokenDanceRechargeOrders,
  type SiteTokenDanceRechargeAccount,
  type SiteTokenDanceRechargeOrder,
} from "@/lib/site-tokendance-recharge";

export type SiteTokenDanceRechargeInitialData = {
  session: Awaited<ReturnType<typeof readSiteAuthSession>>;
  account: SiteTokenDanceRechargeAccount | null;
  orders: SiteTokenDanceRechargeOrder[];
  unavailable: boolean;
};

export async function readSiteTokenDanceRechargeInitialData(
  sessionOverride?: SiteAuthSession,
): Promise<SiteTokenDanceRechargeInitialData> {
  const session = sessionOverride ?? (await readSiteAuthSession());
  if (!session.authenticated) {
    return { session, account: null, orders: [], unavailable: false };
  }

  const token = await readSessionToken();
  if (!token) {
    return { session, account: null, orders: [], unavailable: true };
  }

  const [account, orders] = await Promise.all([
    requestSiteAuthJson("/v1/integrations/tokendance/managed/recharge/account", { token })
      .then(normalizeTokenDanceRechargeAccount)
      .catch(() => null),
    requestSiteAuthJson("/v1/integrations/tokendance/managed/recharge/orders?limit=20", { token })
      .then(normalizeTokenDanceRechargeOrders)
      .catch(() => []),
  ]);

  return {
    session,
    account,
    orders,
    unavailable: account === null,
  };
}

async function readSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(siteSessionCookieName)?.value?.trim() || "";
}
