"use client";

import {
  ArrowClockwise,
  Crown,
  Lightning,
  Receipt,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import {
  BillingShell,
  Feedback,
  formatDateTime,
  formatInteger,
  ModalShell,
  PaymentModalSkeleton,
  RecordEmpty,
  requestBilling,
  resolveBillingError,
  SectionHeading,
} from "@/components/site-billing-shared";
import styles from "@/components/site-tokendance-recharge.module.css";
import { siteTokenDanceRechargeCopy } from "@/components/site-tokendance-recharge-copy";
import type { Locale } from "@/lib/locale";
import type { SiteAuthSession } from "@/lib/site-auth";
import {
  isTokenDanceOrderWaiting,
  normalizeTokenDanceRechargeAccount,
  normalizeTokenDanceRechargeOrder,
  normalizeTokenDanceRechargeOrders,
  normalizeTokenDanceRechargeQuote,
  type SiteTokenDanceRechargeAccount,
  type SiteTokenDanceRechargeOrder,
  type SiteTokenDanceRechargeQuote,
} from "@/lib/site-tokendance-recharge";

type ApiPayload = Record<string, unknown>;
type Notice = { kind: "success" | "error" | "info"; title: string; body?: string };

export function SiteTokenDanceRechargePage({
  locale,
  loginHref,
  viewerSession,
  initialAccount,
  initialOrders,
  unavailable,
}: {
  locale: Locale;
  loginHref: string;
  viewerSession: SiteAuthSession;
  initialAccount: SiteTokenDanceRechargeAccount | null;
  initialOrders: SiteTokenDanceRechargeOrder[];
  unavailable: boolean;
}) {
  const content = siteTokenDanceRechargeCopy[locale];
  const [account, setAccount] = useState(initialAccount);
  const [orders, setOrders] = useState(initialOrders);
  const [amount, setAmount] = useState("30");
  const [quote, setQuote] = useState<SiteTokenDanceRechargeQuote | null>(null);
  const [activeOrder, setActiveOrder] = useState<SiteTokenDanceRechargeOrder | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<Notice | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const signedIn = viewerSession.authenticated && Boolean(viewerSession.account);
  const accountStatus = viewerSession.account?.displayName || content.signedOutState;
  const accountEmail = viewerSession.account?.email?.trim() || null;
  const accountAvatarUrl = viewerSession.account?.avatarUrl?.trim() || null;
  const offerLabel = account?.offer.active ? account.offer.label || content.offerFallback : null;

  async function refreshData(options: { quiet?: boolean } = {}) {
    if (!options.quiet) setRefreshing(true);
    try {
      const [accountPayload, ordersPayload] = (await Promise.all([
        requestBilling("/api/billing/tokendance/account"),
        requestBilling("/api/billing/tokendance/orders"),
      ])) as [ApiPayload, ApiPayload];
      const nextAccount = normalizeTokenDanceRechargeAccount(accountPayload.account ?? accountPayload);
      const nextOrders = normalizeTokenDanceRechargeOrders(ordersPayload);
      if (nextAccount) setAccount(nextAccount);
      setOrders(nextOrders);
      if (!options.quiet) setNotice({ kind: "success", title: content.refreshed });
      return { account: nextAccount, orders: nextOrders };
    } catch (error) {
      if (!options.quiet) {
        const resolved = resolveBillingError(error, content.errors);
        setNotice({ kind: "error", title: resolved.message });
      }
      return null;
    } finally {
      if (!options.quiet) setRefreshing(false);
    }
  }

  async function previewQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    const amountCny = parseIntegerAmount(amount);
    if (!amountCny) {
      setNotice({ kind: "error", title: content.errors.tokendance_recharge_amount_invalid });
      return;
    }
    setQuoting(true);
    try {
      const payload = (await requestBilling("/api/billing/tokendance/quote", {
        method: "POST",
        body: { amountCny },
      })) as ApiPayload;
      const nextQuote = normalizeTokenDanceRechargeQuote(payload.quote ?? payload);
      if (!nextQuote) throw new Error("tokendance_recharge_quote_invalid");
      setQuote(nextQuote);
      idempotencyKeyRef.current = null;
      setQuoteOpen(true);
    } catch (error) {
      const resolved = resolveBillingError(error, content.errors);
      setNotice({ kind: "error", title: resolved.message });
    } finally {
      setQuoting(false);
    }
  }

  async function createOrder() {
    if (!quote) return;
    setCreating(true);
    setPaymentNotice(null);
    try {
      const clientIdempotencyKey = idempotencyKeyRef.current || createClientIdempotencyKey();
      idempotencyKeyRef.current = clientIdempotencyKey;
      const payload = (await requestBilling("/api/billing/tokendance/orders", {
        method: "POST",
        body: { quoteId: quote.quoteId, clientIdempotencyKey },
      })) as ApiPayload;
      const order = normalizeTokenDanceRechargeOrder(payload.order ?? payload);
      if (!order) throw new Error("tokendance_recharge_order_invalid");
      setActiveOrder(order);
      setQuoteOpen(false);
      setPaymentOpen(true);
      setOrders((current) => upsertOrder(current, order));
      idempotencyKeyRef.current = null;
      if (order.status === "paid") await handlePaidOrder(order);
    } catch (error) {
      const resolved = resolveBillingError(error, content.errors);
      setNotice({ kind: "error", title: resolved.message });
    } finally {
      setCreating(false);
    }
  }

  async function refreshOrder(order: SiteTokenDanceRechargeOrder) {
    try {
      const payload = (await requestBilling(
        `/api/billing/tokendance/orders/${encodeURIComponent(order.orderNo)}`,
      )) as ApiPayload;
      const nextOrder = normalizeTokenDanceRechargeOrder(payload.order ?? payload);
      if (!nextOrder) return null;
      setActiveOrder(nextOrder);
      setOrders((current) => upsertOrder(current, nextOrder));
      if (nextOrder.status === "paid") await handlePaidOrder(nextOrder);
      else setPaymentNotice(paymentStateNotice(nextOrder, content));
      return nextOrder;
    } catch (error) {
      const resolved = resolveBillingError(error, content.errors);
      setPaymentNotice({ kind: "error", title: resolved.message });
      return null;
    }
  }

  async function handlePaidOrder(order: SiteTokenDanceRechargeOrder) {
    setPaymentNotice({ kind: "success", title: content.paymentPaid, body: content.paymentPaidBody });
    setNotice({ kind: "success", title: content.paymentPaid, body: content.paymentPaidBody });
    setOrders((current) => upsertOrder(current, order));
    await refreshData({ quiet: true });
  }

  useEffect(() => {
    if (!paymentOpen || !isTokenDanceOrderWaiting(activeOrder)) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const poll = async () => {
      const nextOrder = activeOrder ? await refreshOrder(activeOrder) : null;
      if (stopped || !isTokenDanceOrderWaiting(nextOrder)) return;
      timer = setTimeout(() => void poll(), 3000);
    };
    timer = setTimeout(() => void poll(), 3000);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
    // Polling is keyed by order identity and status; refreshOrder reads that order only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentOpen, activeOrder?.orderNo, activeOrder?.status]);

  return (
    <BillingShell
      homeLabel={content.home}
      homeHref={withLang(locale, "/")}
      sidebarLabel={content.sidebar}
      routes={[
        {
          href: withLang(locale, "/account/membership"),
          icon: <Crown size={20} weight="regular" aria-hidden="true" />,
          label: content.membership,
        },
        {
          href: withLang(locale, "/account/recharge"),
          icon: <Sparkle size={20} weight="regular" aria-hidden="true" />,
          label: content.pointsRecharge,
        },
        {
          href: withLang(locale, "/account/tokendance/recharge"),
          icon: <Lightning size={20} weight="regular" aria-hidden="true" />,
          label: content.tokenDanceCredits,
          active: true,
        },
      ]}
      signedIn={signedIn}
      accountStatus={accountStatus}
      accountEmail={accountEmail}
      accountAvatarUrl={accountAvatarUrl}
      signOutLabel={content.signOut}
    >
      <section className="billing-membership-header">
        <div className="billing-membership-header-row">
          <div className="billing-membership-header-copy">
            <span className="billing-membership-eyebrow">{content.eyebrow}</span>
            <h1 className="billing-membership-title">{content.title}</h1>
            <p className="billing-membership-intro">{content.intro}</p>
          </div>
          <div className="billing-membership-toolbar">
            {offerLabel ? <span className={styles.offerBadge}>{offerLabel}</span> : null}
            {signedIn ? (
              <button
                type="button"
                className="billing-membership-toolbar-action"
                disabled={refreshing}
                onClick={() => void refreshData()}
              >
                <ArrowClockwise size={16} weight="regular" aria-hidden="true" />
                {content.refresh}
              </button>
            ) : (
              <Link href={loginHref} className="billing-membership-toolbar-action">{content.signIn}</Link>
            )}
          </div>
        </div>

        <dl className="billing-membership-meta-strip" aria-label={content.title}>
          <div className="billing-membership-meta-item">
            <dt>{content.availableCredits}</dt>
            <dd>{signedIn && account ? formatInteger(account.remainingPoints) : "-"}</dd>
            <span>{content.creditsUnit}</span>
          </div>
          <div className="billing-membership-meta-item">
            <dt>{content.totalReceived}</dt>
            <dd>{signedIn && account ? formatInteger(account.totalRechargedPoints) : "-"}</dd>
            <span>{content.creditsUnit}</span>
          </div>
          <div className="billing-membership-meta-item">
            <dt>{content.totalUsed}</dt>
            <dd>{signedIn && account ? formatInteger(account.totalConsumedPoints) : "-"}</dd>
            <span>{content.creditsUnit}</span>
          </div>
        </dl>
      </section>

      <div className="billing-membership-view">
        {notice ? <Feedback {...notice} /> : null}

        {!signedIn ? (
          <section className="billing-membership-signed-out-state">
            <p>{content.signedOutTitle}</p>
            <Link href={loginHref} className="billing-membership-toolbar-action">{content.signIn}</Link>
          </section>
        ) : unavailable || !account ? (
          <div className="billing-membership-inline-note">
            <WarningCircle size={18} weight="regular" aria-hidden="true" />
            <span>{content.unavailable}</span>
          </div>
        ) : (
          <section className="billing-section-block billing-membership-section" id="tokendance-recharge">
            <SectionHeading title={content.rechargeTitle} />
            <div className={styles.rechargeGrid}>
              <form className={styles.rechargeForm} onSubmit={(event) => void previewQuote(event)}>
                <div className={styles.sectionCopy}>
                  <h3>{content.rechargeTitle}</h3>
                  <p>{content.rechargeIntro}</p>
                </div>
                <div className={styles.amountField}>
                  <label htmlFor="tokendance-recharge-amount">{content.amountLabel}</label>
                  <div className={styles.amountControl}>
                    <input
                      id="tokendance-recharge-amount"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      required
                      value={amount}
                      placeholder={content.amountPlaceholder}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setQuote(null);
                        idempotencyKeyRef.current = null;
                      }}
                    />
                    <span>{content.amountSuffix}</span>
                  </div>
                  <p className={styles.amountHint}>{content.amountHint}</p>
                </div>
                <button type="submit" className={styles.primaryButton} disabled={quoting}>
                  {quoting ? content.previewingQuote : content.previewQuote}
                </button>
              </form>

              <aside className={styles.ratePanel} aria-label={content.perRequest}>
                <div className={styles.rateValue}>
                  <span>{content.perRequest}</span>
                  <strong>{formatInteger(account.chargePoints)}</strong>
                  <p>{content.perRequestSuffix}</p>
                </div>
                <div className={styles.offerMeta}>
                  {offerLabel ? <span className={styles.offerBadge}>{offerLabel}</span> : null}
                  {offerLabel ? <span>{content.offerRuleHint}</span> : null}
                  {account.offer.expiresAt ? (
                    <span>{content.offerEnds} · {formatDateTime(account.offer.expiresAt, locale)}</span>
                  ) : null}
                </div>
              </aside>
            </div>
          </section>
        )}

        <section className="billing-section-block billing-membership-section" id="tokendance-orders">
          <SectionHeading title={content.recentOrders} />
          {orders.length ? (
            <div className={styles.ordersSurface}>
              <div className={styles.ordersTableWrap}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>{content.amount}</th>
                      <th>{content.credits}</th>
                      <th>{content.status}</th>
                      <th>{content.time}</th>
                      <th>{content.orderNumber}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.orderNo}>
                        <td>{formatCny(order.amountCny)}</td>
                        <td>{formatInteger(order.points)} {content.creditsUnit}</td>
                        <td>
                          <span className={`${styles.status} ${order.status === "paid" ? styles.statusPaid : isTokenDanceOrderWaiting(order) ? styles.statusPending : ""}`.trim()}>
                            {content.statusMap[order.manualReviewRequired ? "manual_review" : order.status] || order.status}
                          </span>
                        </td>
                        <td>{formatDateTime(order.settledAt || order.createdAt, locale)}</td>
                        <td className={styles.orderNo} title={order.orderNo}>{order.orderNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <RecordEmpty title={content.emptyOrders} icon={<Receipt size={26} weight="regular" aria-hidden="true" />} />
          )}
        </section>
      </div>

      {quoteOpen && quote ? (
        <ModalShell
          title={content.quoteTitle}
          heading={content.quoteTitle}
          description={content.quoteDescription}
          onClose={() => { if (!creating) setQuoteOpen(false); }}
        >
          <div className={styles.quoteSummary}>
            <div className={styles.quoteRow}>
              <span>{content.actualPayment}</span>
              <strong>{formatCny(quote.amountCny)}</strong>
            </div>
            <div className={styles.quoteRow}>
              <span>{content.creditsArriving}</span>
              <strong>{formatInteger(quote.points)} {content.creditsUnit}</strong>
            </div>
            {quote.offer.active ? (
              <div className={styles.quoteOffer}>
                <span className={styles.offerBadge}>{quote.offer.label || content.offerFallback}</span>
                <span>{content.offerRuleHint}</span>
                {quote.offer.expiresAt ? <span>{content.offerEnds} · {formatDateTime(quote.offer.expiresAt, locale)}</span> : null}
              </div>
            ) : null}
            {quote.expiresAt ? (
              <div className={styles.quoteRow}>
                <span>{content.quoteExpires}</span>
                <strong>{formatDateTime(quote.expiresAt, locale)}</strong>
              </div>
            ) : null}
            <div className={styles.quoteActions}>
              <button type="button" className={styles.primaryButton} disabled={creating} onClick={() => void createOrder()}>
                {creating ? content.creatingOrder : content.confirmPayment}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {paymentOpen && activeOrder ? (
        <ModalShell
          title={content.paymentTitle}
          heading={content.paymentTitle}
          description={content.paymentDescription}
          onClose={() => setPaymentOpen(false)}
        >
          <div className={styles.paymentSummary}>
            {activeOrder.paymentUrl && activeOrder.status !== "paid" ? (
              <div className={styles.paymentQr}>
                <QRCodeSVG value={activeOrder.paymentUrl} size={220} level="M" includeMargin />
                <strong>{content.scanTitle}</strong>
                <a className={styles.paymentLink} href={activeOrder.paymentUrl} target="_blank" rel="noreferrer">
                  {content.openPayment}
                </a>
              </div>
            ) : isTokenDanceOrderWaiting(activeOrder) ? (
              <PaymentModalSkeleton />
            ) : null}

            <div className={styles.quoteRow}>
              <span>{content.actualPayment}</span>
              <strong>{formatCny(activeOrder.amountCny)}</strong>
            </div>
            <div className={styles.quoteRow}>
              <span>{content.creditsArriving}</span>
              <strong>{formatInteger(activeOrder.points)} {content.creditsUnit}</strong>
            </div>
            <div className={styles.quoteRow}>
              <span>{content.orderNumber}</span>
              <strong className={styles.orderNo}>{activeOrder.orderNo}</strong>
            </div>
            {paymentNotice || isTokenDanceOrderWaiting(activeOrder) ? (
              <div className={styles.paymentStatus} role="status" aria-live="polite">
                <strong>{paymentNotice?.title || content.paymentPending}</strong>
                <p>{paymentNotice?.body || content.paymentPendingBody}</p>
              </div>
            ) : null}
          </div>
        </ModalShell>
      ) : null}
    </BillingShell>
  );
}

function parseIntegerAmount(value: string) {
  const normalized = value.trim();
  if (!/^[1-9]\d*$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isSafeInteger(amount) ? amount : null;
}

function createClientIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

function upsertOrder(current: SiteTokenDanceRechargeOrder[], order: SiteTokenDanceRechargeOrder) {
  return [order, ...current.filter((item) => item.orderNo !== order.orderNo)]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 20);
}

function paymentStateNotice(
  order: SiteTokenDanceRechargeOrder,
  content: (typeof siteTokenDanceRechargeCopy)["zh"] | (typeof siteTokenDanceRechargeCopy)["en"],
): Notice | null {
  if (order.manualReviewRequired || order.status === "manual_review") {
    return { kind: "info", title: content.paymentManualReview, body: content.paymentManualReviewBody };
  }
  if (order.status === "expired" || order.status === "closed") {
    return { kind: "info", title: content.paymentExpired, body: content.paymentExpiredBody };
  }
  if (order.status === "failed") {
    return { kind: "error", title: content.paymentFailed, body: content.paymentFailedBody };
  }
  if (order.status === "paid") {
    return { kind: "success", title: content.paymentPaid, body: content.paymentPaidBody };
  }
  return { kind: "info", title: content.paymentPending, body: content.paymentPendingBody };
}

function formatCny(value: number) {
  return `¥${Number.isFinite(value) ? value.toLocaleString("zh-CN", { maximumFractionDigits: 2 }) : "0"}`;
}

function withLang(locale: string, path: string) {
  return `${path}?lang=${locale}`;
}
