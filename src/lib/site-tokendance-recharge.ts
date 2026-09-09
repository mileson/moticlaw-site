
type JsonRecord = Record<string, unknown>;

export type SiteTokenDanceOffer = {
  active: boolean;
  label: string | null;
  priceBps: number | null;
  expiresAt: string | null;
};

export type SiteTokenDanceRechargeAccount = {
  remainingPoints: number;
  totalRechargedPoints: number;
  totalConsumedPoints: number;
  chargePoints: number;
  offer: SiteTokenDanceOffer;
  rechargeUrl: string | null;
};

export type SiteTokenDanceRechargeQuote = {
  quoteId: string;
  amountCny: number;
  points: number;
  rateRevision: string | null;
  offer: SiteTokenDanceOffer;
  expiresAt: string | null;
};

export type SiteTokenDanceRechargeOrder = {
  orderNo: string;
  quoteId: string;
  status: string;
  amountCny: number;
  points: number;
  rateRevision: string | null;
  offer: SiteTokenDanceOffer;
  paymentUrl: string | null;
  expiresAt: string | null;
  settledAt: string | null;
  manualReviewRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export function normalizeTokenDanceRechargeAccount(value: unknown): SiteTokenDanceRechargeAccount | null {
  const item = recordOf(value);
  if (!item) return null;
  return {
    remainingPoints: numberOf(item.remaining_points ?? item.remainingPoints),
    totalRechargedPoints: numberOf(item.total_recharged_points ?? item.totalRechargedPoints),
    totalConsumedPoints: numberOf(item.total_consumed_points ?? item.totalConsumedPoints),
    chargePoints: numberOf(item.charge_points ?? item.chargePoints),
    offer: normalizeTokenDanceOffer(item.offer),
    rechargeUrl: optionalHttpUrl(item.recharge_url ?? item.rechargeUrl),
  };
}

export function normalizeTokenDanceRechargeQuote(value: unknown): SiteTokenDanceRechargeQuote | null {
  const item = recordOf(value);
  const quoteId = optionalString(item?.quote_id ?? item?.quoteId);
  if (!item || !quoteId) return null;
  return {
    quoteId,
    amountCny: numberOf(item.amount_cny ?? item.amountCny),
    points: numberOf(item.points),
    rateRevision: optionalString(item.rate_revision ?? item.rateRevision),
    offer: normalizeTokenDanceOffer(item.offer),
    expiresAt: optionalString(item.expires_at ?? item.expiresAt),
  };
}

export function normalizeTokenDanceRechargeOrder(value: unknown): SiteTokenDanceRechargeOrder | null {
  const item = recordOf(value);
  const orderNo = optionalString(item?.order_no ?? item?.orderNo);
  const quoteId = optionalString(item?.quote_id ?? item?.quoteId);
  if (!item || !orderNo || !quoteId) return null;
  return {
    orderNo,
    quoteId,
    status: optionalString(item.status) ?? "pending",
    amountCny: numberOf(item.amount_cny ?? item.amountCny),
    points: numberOf(item.points),
    rateRevision: optionalString(item.rate_revision ?? item.rateRevision),
    offer: normalizeTokenDanceOffer(item.offer),
    paymentUrl: optionalHttpUrl(item.payment_url ?? item.paymentUrl),
    expiresAt: optionalString(item.expires_at ?? item.expiresAt),
    settledAt: optionalString(item.settled_at ?? item.settledAt),
    manualReviewRequired: item.manual_review_required === true || item.manualReviewRequired === true,
    createdAt: optionalString(item.created_at ?? item.createdAt) ?? "",
    updatedAt: optionalString(item.updated_at ?? item.updatedAt) ?? "",
  };
}

export function normalizeTokenDanceRechargeOrders(value: unknown) {
  const item = recordOf(value);
  return (Array.isArray(item?.orders) ? item.orders : [])
    .map(normalizeTokenDanceRechargeOrder)
    .filter((order): order is SiteTokenDanceRechargeOrder => Boolean(order));
}

export function isTokenDanceOrderWaiting(order: SiteTokenDanceRechargeOrder | null | undefined) {
  return Boolean(order && (order.status === "creating" || order.status === "pending"));
}

function normalizeTokenDanceOffer(value: unknown): SiteTokenDanceOffer {
  const item = recordOf(value);
  const priceBps = finiteNumberOrNull(item?.price_bps ?? item?.priceBps);
  return {
    active: item?.active === true,
    label: optionalString(item?.label),
    priceBps,
    expiresAt: optionalString(item?.expires_at ?? item?.expiresAt),
  };
}

function recordOf(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberOf(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function finiteNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalHttpUrl(value: unknown) {
  const normalized = optionalString(value);
  if (!normalized) return null;
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
