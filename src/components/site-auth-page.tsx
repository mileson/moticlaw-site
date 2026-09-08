"use client";

import { ArrowSquareOut, Check } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import type { TurnstileWidgetHandle } from "@/components/turnstile-widget";
import { siteAuthCopy } from "@/components/site-auth-copy";
import {
  createDesktopHandoffAttemptGuard,
  isLoopbackDesktopReturnUri,
  nativeDesktopReturnCooldownMs,
  normalizeRememberedDesktopReturnContext,
  resolveEffectiveDesktopReturnContext,
  selectDesktopReturnRetryTarget,
  type DesktopHandoffAttemptSource,
  type DesktopReturnContext,
} from "@/lib/desktop-auth-handoff";
import { localeToHtmlLang, type Locale } from "@/lib/locale";
import type { SiteAuthClientRedirect, SiteAuthPageMode, SiteAuthSession, TurnstileWidgetRegion } from "@/lib/site-auth";

type SuccessState = {
  title: string;
  body: string;
  previewResetUrl?: string | null;
};

type ApiResult = {
  ok?: boolean;
  message?: string;
  previewResetUrl?: string | null;
  previewCode?: string | null;
  clientRedirect?: SiteAuthClientRedirect | null;
  verification?: {
    email?: string | null;
    expiresAt?: string | null;
  } | null;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    request_id?: string | null;
    error_id?: string | null;
  };
};

type ApiErrorState = NonNullable<ApiResult["error"]>;
type DesktopReturnPermissionState = PermissionState | "unsupported";
type RegisterStep = "details" | "verify";
type LoginStep = "email" | "verify";
type TurnstileMode = "login" | "register" | "forgot-password";
type DesktopReturnSubmission = "confirmed" | "dispatched" | "failed";

const textFieldClassName =
  "w-full rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-60 dark:placeholder:text-slate-500";
const subtleLinkClassName = "text-sm font-medium text-[var(--accent-strong)] transition hover:opacity-80";
const secondaryButtonClassName =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[1rem] border border-[var(--line)] bg-[var(--glass)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--surface)] disabled:cursor-not-allowed";
const primaryButtonClassName =
  "inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[1rem] bg-[var(--accent)] px-5 text-base font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60";
const rememberedDesktopReturnContextStorageKey = "moticlaw.site.desktop-return-context.v1";
const rememberedDesktopReturnContextTtlMs = 30 * 60 * 1000;

export function SiteAuthPage({
  mode,
  locale,
  turnstileSiteKey,
  turnstileRegion,
  viewerSession,
  initialResetToken,
  clientRedirectUri,
  fallbackRedirectUri,
  returnToPath,
  requestedProvider = null,
  oauthErrorCode = null,
  websiteDesktopClientRedirectUri,
}: {
  mode: SiteAuthPageMode;
  locale: Locale;
  turnstileSiteKey: string | null;
  turnstileRegion: TurnstileWidgetRegion | null;
  viewerSession: SiteAuthSession;
  initialResetToken: string | null;
  clientRedirectUri: string | null;
  fallbackRedirectUri: string | null;
  returnToPath: string | null;
  requestedProvider?: "watcha" | null;
  oauthErrorCode?: string | null;
  websiteDesktopClientRedirectUri: string | null;
}) {
  const content = siteAuthCopy[locale];
  const modeContent = content.modes[mode];
  const [email, setEmail] = useState(viewerSession.account?.email || "");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("details");
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [registerVerificationEmail, setRegisterVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [registerVerificationNotice, setRegisterVerificationNotice] = useState<string | null>(null);
  const [registerPreviewCode, setRegisterPreviewCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState(initialResetToken || "");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loginTurnstileRequired, setLoginTurnstileRequired] = useState(false);
  const [turnstileChallengePending, setTurnstileChallengePending] = useState(false);
  const [turnstileNoticeCode, setTurnstileNoticeCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [watchaRedirecting, setWatchaRedirecting] = useState(false);
  const [errorState, setErrorState] = useState<ApiErrorState | null>(null);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [desktopReturnPrepared, setDesktopReturnPrepared] = useState<SiteAuthClientRedirect | null>(null);
  const [desktopReturnPending, setDesktopReturnPending] = useState<SiteAuthClientRedirect | null>(null);
  const [desktopReturnConfirmed, setDesktopReturnConfirmed] = useState(false);
  const [loopbackPermissionState, setLoopbackPermissionState] = useState<DesktopReturnPermissionState>("unsupported");
  const [rememberedDesktopReturnContext, setRememberedDesktopReturnContext] = useState<DesktopReturnContext | null>(null);
  const turnstileWidgetRef = useRef<TurnstileWidgetHandle | null>(null);
  const pendingTurnstileSubmitRef = useRef<TurnstileMode | null>(null);
  const submitInFlightRef = useRef(false);
  const lastAutoSubmittedVerificationRef = useRef("");
  const desktopHandoffAttemptGuardRef = useRef(createDesktopHandoffAttemptGuard());

  const effectiveDesktopReturnContext = useMemo(
    () => resolveEffectiveDesktopReturnContext(clientRedirectUri, fallbackRedirectUri, rememberedDesktopReturnContext),
    [clientRedirectUri, fallbackRedirectUri, rememberedDesktopReturnContext],
  );
  const effectiveClientRedirectUri = effectiveDesktopReturnContext.clientRedirectUri;
  const effectiveFallbackRedirectUri = effectiveDesktopReturnContext.fallbackRedirectUri;

  useEffect(() => {
    setResetToken(initialResetToken || "");
  }, [initialResetToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (clientRedirectUri) {
      setRememberedDesktopReturnContext(persistRememberedDesktopReturnContext(clientRedirectUri, fallbackRedirectUri));
      return;
    }
    if (!fallbackRedirectUri && !returnToPath && !requestedProvider && !oauthErrorCode) {
      clearRememberedDesktopReturnContext();
      setRememberedDesktopReturnContext(null);
      return;
    }
    setRememberedDesktopReturnContext(readRememberedDesktopReturnContext());
  }, [clientRedirectUri, fallbackRedirectUri, oauthErrorCode, requestedProvider, returnToPath]);

  useEffect(() => {
    if (mode !== "register") {
      setRegisterStep("details");
      setRegisterVerificationEmail("");
      setVerificationCode("");
      setRegisterVerificationNotice(null);
      setRegisterPreviewCode(null);
    }
    if (mode !== "login") setLoginStep("email");
    setLoginTurnstileRequired(false);
    resetTurnstile();
  }, [mode]);

  useEffect(() => {
    setDesktopReturnPrepared(null);
    setDesktopReturnPending(null);
    setDesktopReturnConfirmed(false);
    desktopHandoffAttemptGuardRef.current.reset();
    setLoopbackPermissionState("unsupported");
  }, [effectiveClientRedirectUri, effectiveFallbackRedirectUri, mode, viewerSession.authenticated]);

  const footerHref = useMemo(() => {
    if (mode === "login") return withAuthPageQuery("/register", locale, effectiveClientRedirectUri, effectiveFallbackRedirectUri, returnToPath);
    if (mode === "register") return withAuthPageQuery("/login", locale, effectiveClientRedirectUri, effectiveFallbackRedirectUri, returnToPath);
    if (mode === "forgot-password") return withAuthPageQuery("/login", locale, effectiveClientRedirectUri, effectiveFallbackRedirectUri, returnToPath);
    return withAuthPageQuery("/forgot-password", locale, effectiveClientRedirectUri, effectiveFallbackRedirectUri, returnToPath);
  }, [effectiveClientRedirectUri, effectiveFallbackRedirectUri, locale, mode, returnToPath]);

  const returnToHref = useMemo(
    () => (returnToPath ? withLocaleQuery(returnToPath, locale) : null),
    [locale, returnToPath],
  );
  const watchaOAuthHref = useMemo(
    () => buildWatchaOAuthHref(locale, effectiveClientRedirectUri, effectiveFallbackRedirectUri, returnToPath),
    [effectiveClientRedirectUri, effectiveFallbackRedirectUri, locale, returnToPath],
  );

  const desktopReturnLoopbackUri = useMemo(() => {
    const preparedLoopback = resolveLoopbackRedirectAction(desktopReturnPrepared);
    if (preparedLoopback) return preparedLoopback;
    if (effectiveClientRedirectUri && isLoopbackDesktopReturnUri(effectiveClientRedirectUri)) return effectiveClientRedirectUri;
    if (effectiveFallbackRedirectUri && isLoopbackDesktopReturnUri(effectiveFallbackRedirectUri)) return effectiveFallbackRedirectUri;
    return null;
  }, [desktopReturnPrepared, effectiveClientRedirectUri, effectiveFallbackRedirectUri]);

  const desktopReturnUsesLoopback = Boolean(desktopReturnLoopbackUri);
  const desktopReturnErrorCode = errorState?.code === "desktop_return_blocked" || errorState?.code === "desktop_return_failed"
    ? errorState.code
    : null;
  const showDesktopReturnBlockedGuide = desktopReturnUsesLoopback && (loopbackPermissionState === "denied" || desktopReturnErrorCode === "desktop_return_blocked");
  const showDesktopReturnRetryGuide = desktopReturnUsesLoopback && desktopReturnErrorCode === "desktop_return_failed";
  const canRetryPreparedDesktopReturn = Boolean(desktopReturnPrepared && !desktopReturnPending);
  const canRetryDesktopHandoff = Boolean(
    !desktopReturnConfirmed
      && viewerSession.authenticated
      && mode === "login"
      && effectiveClientRedirectUri
      && !desktopReturnPrepared
      && !desktopReturnPending,
  );
  const desktopReturnActive = Boolean(desktopReturnPending);
  const showDesktopReturnAction = Boolean(effectiveClientRedirectUri && (desktopReturnPrepared || desktopReturnPending || canRetryDesktopHandoff));
  const desktopReturnActionDisabled = submitting || desktopReturnActive || (!canRetryPreparedDesktopReturn && !canRetryDesktopHandoff);
  const registerVerificationActive = mode === "register" && registerStep === "verify";
  const loginVerificationActive = mode === "login" && loginStep === "verify";
  const verificationActive = registerVerificationActive || loginVerificationActive;
  const watchaLoginDisabled = submitting || desktopReturnActive || watchaRedirecting;

  const resolvedErrorMessage = turnstileNoticeCode
    ? content.errors[turnstileNoticeCode as keyof typeof content.errors] || content.errors.site_auth_http_502
    : errorState
    ? content.errors[errorState.code as keyof typeof content.errors] || errorState.message || content.errors.site_auth_http_502
    : null;
  const showTurnstile = Boolean(turnstileSiteKey && ((mode === "login" && !loginVerificationActive) || mode === "forgot-password"));
  const turnstileRequiredForSubmit = Boolean(
    turnstileSiteKey && (
      mode === "forgot-password"
      || (mode === "login" && !loginVerificationActive && loginTurnstileRequired)
    ),
  );
  const submitDisabled = submitting || turnstileChallengePending || watchaRedirecting;

  useEffect(() => {
    if (!oauthErrorCode) return;
    setErrorState({ code: oauthErrorCode });
  }, [oauthErrorCode]);

  function logTurnstileEvent(
    event: string,
    extra: {
      scriptLoadMs?: number;
      errorCode?: string;
      retryCount?: number;
      exhausted?: boolean;
    } = {},
  ) {
    void fetch("/api/auth/event", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        kind: "turnstile",
        event,
        mode,
        turnstileRegion,
        script_load_ms: extra.scriptLoadMs,
        errorCode: extra.errorCode,
        retry_count: extra.retryCount,
        exhausted: extra.exhausted,
      }),
    }).catch(() => null);
  }

  useEffect(() => {
    if (!desktopReturnLoopbackUri) {
      setLoopbackPermissionState("unsupported");
      return;
    }

    let cancelled = false;
    const refreshPermission = async () => {
      const nextState = await queryDesktopReturnPermission(desktopReturnLoopbackUri);
      if (!cancelled) setLoopbackPermissionState(nextState);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshPermission();
      }
    };

    void refreshPermission();
    window.addEventListener("focus", refreshPermission);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshPermission);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [desktopReturnLoopbackUri]);

  useEffect(() => {
    if (loopbackPermissionState === "granted" && errorState?.code === "desktop_return_blocked") {
      setErrorState(null);
    }
  }, [errorState?.code, loopbackPermissionState]);

  async function finishDesktopReturn(redirect: SiteAuthClientRedirect) {
    try {
      const submission = await submitDesktopReturn(redirect);
      if (submission === "failed") {
        const failureCode = await resolveDesktopReturnFailureCode(redirect);
        if (failureCode === "desktop_return_blocked" && desktopReturnUsesLoopback) {
          setLoopbackPermissionState("denied");
        }
        setErrorState({ code: failureCode });
        return false;
      }
      setErrorState(null);
      if (submission === "confirmed") {
        setDesktopReturnConfirmed(true);
        setDesktopReturnPrepared(null);
        clearRememberedDesktopReturnContext();
        setRememberedDesktopReturnContext(null);
        setSuccessState({
          title: content.alreadySignedIn.successTitle,
          body: content.desktopReturn.confirmedBody,
        });
      } else {
        setSuccessState({
          title: content.alreadySignedIn.successTitle,
          body: content.desktopReturn.dispatchedBody,
        });
      }
      return true;
    } catch {
      const failureCode = await resolveDesktopReturnFailureCode(redirect);
      if (failureCode === "desktop_return_blocked" && desktopReturnUsesLoopback) {
        setLoopbackPermissionState("denied");
      }
      setErrorState({ code: failureCode });
      return false;
    }
  }

  function resetTurnstile(options: { clearNotice?: boolean; clearPending?: boolean } = {}) {
    const { clearNotice = true, clearPending = true } = options;
    setTurnstileToken(null);
    if (clearNotice) {
      setTurnstileNoticeCode(null);
    }
    if (clearPending) {
      pendingTurnstileSubmitRef.current = null;
      setTurnstileChallengePending(false);
    }
    turnstileWidgetRef.current?.reset();
  }

  async function requestTurnstileChallenge(nextMode: TurnstileMode) {
    if (!showTurnstile || !turnstileSiteKey) {
      setTurnstileNoticeCode("turnstile_network_limited");
      return false;
    }
    pendingTurnstileSubmitRef.current = nextMode;
    setTurnstileChallengePending(true);
    setTurnstileNoticeCode(null);
    setTurnstileToken(null);
    const started = (await turnstileWidgetRef.current?.execute()) ?? false;
    if (!started) {
      pendingTurnstileSubmitRef.current = null;
      setTurnstileChallengePending(false);
      setTurnstileNoticeCode("turnstile_network_limited");
      logTurnstileEvent("execute_failed", {
        errorCode: "turnstile_execute_failed",
        retryCount: 0,
        exhausted: true,
      });
      return false;
    }
    logTurnstileEvent("execute_requested");
    return true;
  }

  async function submitCurrentMode() {
    if (submitting || desktopReturnActive || submitInFlightRef.current) {
      return;
    }

    const clientValidationCode = validateClientInput(mode, {
      email,
      registerStep,
      loginStep,
      verificationCode,
      newPassword,
      resetToken,
    });
    if (clientValidationCode) {
      setErrorState({ code: clientValidationCode });
      return;
    }

    setErrorState(null);
    setTurnstileNoticeCode(null);
    setSuccessState(null);

    if (turnstileRequiredForSubmit && !turnstileToken && isTurnstileMode(mode)) {
      await requestTurnstileChallenge(mode);
      return;
    }

    submitInFlightRef.current = true;
    setSubmitting(true);
    try {
      if (mode === "login") {
        const result = await postAuth(loginVerificationActive ? "/api/auth/login-verify" : "/api/auth/login-request-code", {
          email: registerVerificationEmail || email.trim(),
          ...(loginVerificationActive ? { code: verificationCode.trim() } : { turnstileToken, turnstileSiteKey, turnstileRegion }),
          clientRedirectUri: effectiveClientRedirectUri,
          fallbackRedirectUri: effectiveFallbackRedirectUri,
        });
        if (!result.ok) {
          if (isLoginRiskTurnstileRequired(result.error)) {
            setLoginTurnstileRequired(true);
            resetTurnstile();
            await requestTurnstileChallenge("login");
            return;
          }
          setErrorState(result.error || {});
          if (turnstileToken || loginTurnstileRequired) {
            resetTurnstile({ clearNotice: false });
          }
          return;
        }
        if (!loginVerificationActive) {
          setLoginTurnstileRequired(false);
          setLoginStep("verify");
          setRegisterVerificationEmail(result.verification?.email || email.trim());
          setRegisterVerificationNotice(content.registerVerification.sentBody);
          setRegisterPreviewCode(result.previewCode || null);
          setVerificationCode("");
          resetTurnstile();
          return;
        }
        setLoginTurnstileRequired(false);
        resetTurnstile();
        if (result.clientRedirect) {
          setVerificationCode("");
          setSuccessState({
            title: modeContent.successTitle,
            body: modeContent.successBody,
          });
          await queueDesktopReturn(result.clientRedirect);
          return;
        }
        if (returnToHref) {
          window.location.assign(returnToHref);
          return;
        }
        window.location.reload();
        return;
      }

      if (mode === "register") {
        if (registerVerificationActive) {
          const result = await postAuth("/api/auth/register-verify", {
            email: registerVerificationEmail || email.trim(),
            code: verificationCode.trim(),
            clientRedirectUri: effectiveClientRedirectUri,
            fallbackRedirectUri: effectiveFallbackRedirectUri,
          });
          if (!result.ok) {
            setErrorState(result.error || {});
            return;
          }
          setVerificationCode("");
          setRegisterPreviewCode(null);
          setRegisterVerificationNotice(null);
          if (result.clientRedirect) {
            setSuccessState({
              title: modeContent.successTitle,
              body: modeContent.successBody,
            });
            await queueDesktopReturn(result.clientRedirect);
            return;
          }
          setSuccessState({
            title: modeContent.successTitle,
            body: result.message || modeContent.successBody,
          });
          return;
        }

        const result = await postAuth("/api/auth/register", {
          email: email.trim(),
          turnstileToken,
          turnstileSiteKey,
          turnstileRegion,
        });
        if (!result.ok) {
          setErrorState(result.error || {});
          resetTurnstile({ clearNotice: false });
          return;
        }
        setRegisterStep("verify");
        setRegisterVerificationEmail(result.verification?.email || email.trim());
        setRegisterVerificationNotice(content.registerVerification.sentBody);
        setRegisterPreviewCode(result.previewCode || null);
        setVerificationCode("");
        resetTurnstile();
        return;
      }

      if (mode === "forgot-password") {
        const result = await postAuth("/api/auth/forgot-password", {
          email: email.trim(),
          turnstileToken,
          turnstileSiteKey,
          turnstileRegion,
        });
        if (!result.ok) {
          setErrorState(result.error || {});
          resetTurnstile({ clearNotice: false });
          return;
        }
        setSuccessState({
          title: modeContent.successTitle,
          body: result.message || modeContent.successBody,
          previewResetUrl: result.previewResetUrl || null,
        });
        resetTurnstile();
        return;
      }

      const result = await postAuth("/api/auth/reset-password", {
        token: resetToken.trim(),
        newPassword,
      });
      if (!result.ok) {
        setErrorState(result.error || {});
        return;
      }
      setNewPassword("");
      setSuccessState({
        title: modeContent.successTitle,
        body: result.message || modeContent.successBody,
      });
    } finally {
      submitInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  const autoSubmitCompletedVerification = useEffectEvent(() => {
    if (!verificationActive || verificationCode.length !== 6 || submitDisabled || desktopReturnActive) {
      return;
    }

    const submissionKey = `${mode}:${registerVerificationEmail || email.trim()}:${verificationCode}`;
    if (lastAutoSubmittedVerificationRef.current === submissionKey) {
      return;
    }

    lastAutoSubmittedVerificationRef.current = submissionKey;
    void submitCurrentMode();
  });

  useEffect(() => {
    if (!verificationActive || verificationCode.length !== 6) {
      lastAutoSubmittedVerificationRef.current = "";
      return;
    }
    autoSubmitCompletedVerification();
  }, [desktopReturnActive, submitDisabled, verificationActive, verificationCode]);

  const flushPendingTurnstileSubmit = useEffectEvent(() => {
    logTurnstileEvent("token_received");
    void submitCurrentMode();
  });

  useEffect(() => {
    if (!turnstileToken) {
      return;
    }
    const pendingMode = pendingTurnstileSubmitRef.current;
    if (!pendingMode || pendingMode !== mode) {
      return;
    }
    pendingTurnstileSubmitRef.current = null;
    setTurnstileChallengePending(false);
    setTurnstileNoticeCode(null);
    flushPendingTurnstileSubmit();
  }, [mode, turnstileToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCurrentMode();
  }

  function handleWatchaLogin() {
    if (watchaLoginDisabled || mode !== "login") return;
    setErrorState(null);
    setSuccessState(null);
    setWatchaRedirecting(true);
    window.location.assign(watchaOAuthHref);
  }

  async function handleLogout() {
    if (submitting || desktopReturnActive) return;
    setSubmitting(true);
    setErrorState(null);
    try {
      const result = await postAuth("/api/auth/logout", {});
      if (!result.ok) {
        setErrorState(result.error || {});
        return;
      }
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendRegisterCode() {
    if (submitting || desktopReturnActive || !verificationActive) return;
    setSubmitting(true);
    setErrorState(null);
    try {
      const result = await postAuth(loginVerificationActive ? "/api/auth/login-request-code" : "/api/auth/register-resend", {
        email: registerVerificationEmail || email.trim(),
      });
      if (!result.ok) {
        setErrorState(result.error || {});
        return;
      }
      setRegisterVerificationNotice(content.registerVerification.resentBody);
      setRegisterPreviewCode(result.previewCode || null);
      setVerificationCode("");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditRegisterEmail() {
    if (submitting || desktopReturnActive) return;
    setRegisterStep("details");
    setLoginStep("email");
    setVerificationCode("");
    setRegisterVerificationNotice(null);
    setRegisterPreviewCode(null);
    setErrorState(null);
    resetTurnstile();
  }

  async function requestDesktopReturn(
    clientRedirectUri: string,
    fallbackRedirectUri: string | null,
    source: DesktopHandoffAttemptSource = "manual",
  ) {
    const attemptGuard = desktopHandoffAttemptGuardRef.current;
    if (submitting || desktopReturnActive || !attemptGuard.begin(source)) return;
    let dispatchOwnsAttempt = false;
    setSubmitting(true);
    setErrorState(null);
    try {
      const result = await postAuth("/api/auth/handoff", {
        clientRedirectUri,
        fallbackRedirectUri,
      });
      if (!result.ok || !result.clientRedirect) {
        setErrorState(result.error || {});
        return;
      }
      setSuccessState({
        title: content.alreadySignedIn.successTitle,
        body: content.alreadySignedIn.successBody,
      });
      dispatchOwnsAttempt = true;
      await queueDesktopReturn(result.clientRedirect, source, true);
    } finally {
      if (!dispatchOwnsAttempt) attemptGuard.finish();
      setSubmitting(false);
    }
  }

  async function handleDesktopReturn() {
    if (!effectiveClientRedirectUri) return;
    await requestDesktopReturn(effectiveClientRedirectUri, effectiveFallbackRedirectUri);
  }

  async function handleWebsiteDesktopReturn() {
    if (!websiteDesktopClientRedirectUri) return;
    await requestDesktopReturn(websiteDesktopClientRedirectUri, null);
  }

  async function handleRetryDesktopReturn() {
    if (submitting || desktopReturnActive) return;
    if (desktopReturnPrepared && !isUnsupportedNonLoopbackDesktopReturn(desktopReturnPrepared)) {
      setSubmitting(true);
      setErrorState(null);
      try {
        const retryRedirect = selectDesktopReturnRetryTarget(desktopReturnPrepared);
        await queueDesktopReturn(retryRedirect, "manual");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (canRetryDesktopHandoff || isUnsupportedNonLoopbackDesktopReturn(desktopReturnPrepared)) {
      await handleDesktopReturn();
    }
  }

  const autoStartDesktopReturn = useEffectEvent(() => {
    if (!effectiveClientRedirectUri) return;
    void requestDesktopReturn(effectiveClientRedirectUri, effectiveFallbackRedirectUri, "automatic");
  });

  useEffect(() => {
    if (submitting || desktopReturnActive || successState) return;
    if (!viewerSession.authenticated || mode !== "login" || !effectiveClientRedirectUri) return;
    autoStartDesktopReturn();
  }, [desktopReturnActive, effectiveClientRedirectUri, mode, submitting, successState, viewerSession.authenticated]);

  const autoStartWatchaLogin = useEffectEvent(() => handleWatchaLogin());

  useEffect(() => {
    if (requestedProvider !== "watcha") return;
    if (oauthErrorCode || viewerSession.authenticated || mode !== "login") return;
    if (watchaLoginDisabled || successState) return;
    autoStartWatchaLogin();
  }, [mode, oauthErrorCode, requestedProvider, successState, viewerSession.authenticated, watchaLoginDisabled]);

  async function queueDesktopReturn(
    redirect: SiteAuthClientRedirect,
    source: DesktopHandoffAttemptSource = "automatic",
    attemptAlreadyStarted = false,
  ) {
    const attemptGuard = desktopHandoffAttemptGuardRef.current;
    if (!attemptAlreadyStarted && !attemptGuard.begin(source)) return false;

    try {
      setDesktopReturnPrepared(redirect);
      logDesktopReturnEvent("desktop_return_prepared", redirect, {
        loopbackPermission: loopbackPermissionState,
      });
      const loopbackRedirect = resolveLoopbackRedirect(redirect);
      if (loopbackRedirect) {
        const permissionState = await queryDesktopReturnPermission(loopbackRedirect.action);
        setLoopbackPermissionState(permissionState);
        if (permissionState === "denied" && redirect.method === "post") {
          logDesktopReturnEvent("desktop_return_blocked", redirect, {
            detail: "loopback_permission_denied",
            loopbackPermission: permissionState,
          });
          setErrorState({ code: "desktop_return_blocked" });
          return false;
        }
      }
      setDesktopReturnPending(redirect);
      return await finishDesktopReturn(redirect);
    } finally {
      setDesktopReturnPending(null);
      attemptGuard.finish();
    }
  }

  async function submitDesktopReturn(redirect: SiteAuthClientRedirect): Promise<DesktopReturnSubmission> {
    if (redirect.method === "get") {
      logDesktopReturnEvent("desktop_return_native_attempted", redirect);
      window.location.assign(redirect.action);
      await waitForNativeDesktopReturnCooldown();
      logDesktopReturnEvent("desktop_return_native_dispatched", redirect, {
        detail: "native_callback_dispatched_unconfirmed",
      });
      return "dispatched";
    }

    if (!isLoopbackDesktopReturnUri(redirect.action)) return "failed";

    try {
      const response = await fetch(redirect.action, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        headers: {
          accept: "text/html,application/xhtml+xml",
        },
        body: new URLSearchParams(redirect.fields || {}),
      });
      const ok = response.ok;
      logDesktopReturnEvent(ok ? "desktop_return_loopback_succeeded" : "desktop_return_failed", redirect, {
        detail: ok ? "loopback_post_ok" : `loopback_http_${response.status}`,
      });
      return ok ? "confirmed" : "failed";
    } catch {
      logDesktopReturnEvent("desktop_return_fallback_attempted", redirect, {
        detail: "loopback_form_after_fetch_failed",
      });
      const started = await submitLoopbackFormRedirect(redirect);
      if (started) {
        logDesktopReturnEvent("desktop_return_loopback_form_started", redirect, {
          detail: "loopback_form_after_fetch_failed",
        });
        return "dispatched";
      }
      logDesktopReturnEvent("desktop_return_failed", redirect, {
        detail: "loopback_fetch_failed_then_form_not_started",
      });
      return "failed";
    }
  }

  return (
    <main lang={localeToHtmlLang(locale)} className="relative isolate min-h-screen overflow-hidden text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-[-5rem] h-[20rem] w-[20rem] rounded-full bg-[var(--bg-glow-1)] blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-5rem] h-[24rem] w-[24rem] rounded-full bg-[var(--bg-glow-2)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,rgba(8,10,16,0.18),transparent_28%)]" />
      </div>

      <a href={withAuthPageQuery("/", locale, null, null)} className="absolute left-5 top-5 z-10 sm:left-8 sm:top-7">
        <BrandLockup />
      </a>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-1 items-center justify-center py-20 sm:py-24">
          <div className="w-full max-w-[25.75rem]">
            <section className="text-left">
              <h1
                className="display mt-6 max-w-[24rem] text-[clamp(2.15rem,5vw,3.35rem)] leading-[1.02] tracking-[-0.02em] text-[var(--foreground)]"
                style={{ textWrap: "balance" }}
              >
                {modeContent.title}
              </h1>
              <p className="mt-3 max-w-[24rem] text-[15px] leading-7 text-[var(--muted)]">{modeContent.body}</p>
            </section>

            {successState ? (
              <NoticeCard tone="success" className="mt-9">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.12] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/[0.12] dark:text-emerald-200">
                    <Check size={28} weight="bold" aria-hidden="true" />
                  </div>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
                    {modeContent.eyebrow}
                  </span>
                </div>
                <h2 className="mt-5 text-center text-2xl font-semibold text-[var(--foreground)]">{successState.title}</h2>
                <p className="mt-3 text-center text-sm leading-6 text-[var(--muted)]">{successState.body}</p>
                {showDesktopReturnAction ? (
                  <button
                    type="button"
                    onClick={() => void handleRetryDesktopReturn()}
                    disabled={desktopReturnActionDisabled}
                    className={`${primaryButtonClassName} mt-6`}
                    style={{ boxShadow: "0 22px 38px var(--accent-soft)" }}
                  >
                    {content.alreadySignedIn.continueAction}
                  </button>
                ) : null}
                {desktopReturnActive ? (
                  <p className="mt-4 text-center text-sm leading-6 text-[var(--muted)]">{content.alreadySignedIn.returning}</p>
                ) : showDesktopReturnAction ? (
                  <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">{content.desktopReturn.actionHint}</p>
                ) : null}
                {successState.previewResetUrl ? (
                  <a href={successState.previewResetUrl} className={`${secondaryButtonClassName} mt-5 w-full`}>
                    {content.previewReset}
                  </a>
                ) : null}
                {resolvedErrorMessage ? <InlineNotice tone="error">{resolvedErrorMessage}</InlineNotice> : null}
                {showDesktopReturnBlockedGuide || showDesktopReturnRetryGuide ? (
                  <DesktopReturnHelp
                    blocked={showDesktopReturnBlockedGuide}
                    locale={locale}
                    onRetry={() => void handleRetryDesktopReturn()}
                    retryLabel={content.desktopReturn.retryAction}
                    title={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedTitle : content.desktopReturn.failedTitle}
                    body={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedBody : content.desktopReturn.failedBody}
                    steps={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedSteps : []}
                    disabled={submitting || desktopReturnActive || (!canRetryPreparedDesktopReturn && !canRetryDesktopHandoff)}
                  />
                ) : null}
              </NoticeCard>
            ) : viewerSession.authenticated && mode === "login" ? (
              <NoticeCard tone="success" className="mt-9">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.12] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/[0.12] dark:text-emerald-200">
                    <Check size={28} weight="bold" aria-hidden="true" />
                  </div>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
                    {content.alreadySignedIn.eyebrow}
                  </span>
                </div>
                <h2 className="mt-5 text-center text-2xl font-semibold text-[var(--foreground)]">{content.alreadySignedIn.title}</h2>
                <p className="mt-3 text-center text-sm leading-6 text-[var(--muted)]">
                  {effectiveClientRedirectUri ? content.alreadySignedIn.confirmBody : content.alreadySignedIn.websiteBody}
                </p>
                {viewerSession.account ? (
                  <div className="mt-5 rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-center text-sm text-[var(--muted)]">
                    <span className="block font-semibold text-[var(--foreground)]">{viewerSession.account.displayName}</span>
                    {viewerSession.account.email ? <span className="mt-1 block">{viewerSession.account.email}</span> : null}
                  </div>
                ) : null}
                <div className="mt-5 flex flex-col gap-3">
                  {effectiveClientRedirectUri ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleDesktopReturn()}
                        disabled={submitting || desktopReturnActive}
                        className={primaryButtonClassName}
                        style={{ boxShadow: "0 22px 38px var(--accent-soft)" }}
                      >
                        {content.alreadySignedIn.continueAction}
                      </button>
                      <button type="button" onClick={() => void handleLogout()} disabled={submitting || desktopReturnActive} className={secondaryButtonClassName}>
                        {content.alreadySignedIn.switchAccountAction}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleWebsiteDesktopReturn()}
                        disabled={submitting || desktopReturnActive || !websiteDesktopClientRedirectUri}
                        className={primaryButtonClassName}
                        style={{ color: "#fff", boxShadow: "0 18px 36px var(--accent-soft)" }}
                      >
                        <ArrowSquareOut size={16} weight="regular" aria-hidden="true" />
                        <span className="ml-2">{content.alreadySignedIn.websiteAction}</span>
                      </button>
                      <button type="button" onClick={() => void handleLogout()} disabled={submitting || desktopReturnActive} className={secondaryButtonClassName}>
                        {content.alreadySignedIn.logout}
                      </button>
                    </>
                  )}
                </div>
                {effectiveClientRedirectUri && desktopReturnActive && !resolvedErrorMessage ? (
                  <p className="mt-4 text-center text-sm leading-6 text-[var(--muted)]">{content.alreadySignedIn.returning}</p>
                ) : effectiveClientRedirectUri ? (
                  <p className="mt-3 text-center text-xs leading-5 text-[var(--muted)]">{content.desktopReturn.actionHint}</p>
                ) : null}
                {resolvedErrorMessage ? <InlineNotice tone="error">{resolvedErrorMessage}</InlineNotice> : null}
                {showDesktopReturnBlockedGuide || showDesktopReturnRetryGuide ? (
                  <DesktopReturnHelp
                    blocked={showDesktopReturnBlockedGuide}
                    locale={locale}
                    onRetry={() => void handleRetryDesktopReturn()}
                    retryLabel={content.desktopReturn.retryAction}
                    title={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedTitle : content.desktopReturn.failedTitle}
                    body={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedBody : content.desktopReturn.failedBody}
                    steps={showDesktopReturnBlockedGuide ? content.desktopReturn.blockedSteps : []}
                    disabled={desktopReturnActionDisabled}
                  />
                ) : null}
              </NoticeCard>
            ) : (
              <form className="mt-9 space-y-4" onSubmit={handleSubmit}>
                {verificationActive ? (
                  <>
                    <InlineNotice tone="success">{registerVerificationNotice || content.registerVerification.sentBody}</InlineNotice>
                    <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                        {content.fields.email}
                      </span>
                      <span className="mt-1 block font-semibold text-[var(--foreground)]">{registerVerificationEmail || email.trim()}</span>
                    </div>
                    <VerificationCodeField
                      label={content.fields.emailVerificationCode}
                      value={verificationCode}
                      onChange={setVerificationCode}
                    />
                    {registerPreviewCode ? (
                      <InlineNotice tone="success">
                        {content.registerVerification.previewCodePrefix}
                        {registerPreviewCode}
                      </InlineNotice>
                    ) : null}
                  </>
                ) : null}

                {mode !== "reset-password" && !verificationActive ? (
                  <AuthField
                    label={content.fields.email}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={content.fields.emailPlaceholder}
                  />
                ) : null}

                {mode === "reset-password" ? (
                    <>
                      {initialResetToken ? (
                        <InlineNotice tone="success">{content.resetTokenReady}</InlineNotice>
                      ) : (
                        <AuthField
                          label={content.fields.resetToken}
                          name="resetToken"
                          type="text"
                          required
                          value={resetToken}
                          onChange={(event) => setResetToken(event.target.value)}
                          placeholder={content.fields.resetTokenPlaceholder}
                        />
                      )}

                      <AuthField
                        label={content.fields.newPassword}
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder={content.fields.newPasswordPlaceholder}
                      />
                    </>
                  ) : null}

                {showTurnstile ? (
                  <TurnstileWidget
                    ref={turnstileWidgetRef}
                    locale={locale}
                    siteKey={turnstileSiteKey}
                    onTokenChange={setTurnstileToken}
                    onError={({ errorCode, retryCount, exhausted }) => {
                      logTurnstileEvent("challenge_error", {
                        errorCode,
                        retryCount,
                        exhausted,
                      });
                      if (exhausted) {
                        pendingTurnstileSubmitRef.current = null;
                        setTurnstileChallengePending(false);
                        setTurnstileNoticeCode("turnstile_network_limited");
                      }
                    }}
                    onExpired={() => {
                      setTurnstileToken(null);
                      logTurnstileEvent("token_expired");
                    }}
                    onTimeout={() => {
                      pendingTurnstileSubmitRef.current = null;
                      setTurnstileChallengePending(false);
                      setTurnstileNoticeCode("turnstile_network_limited");
                      logTurnstileEvent("challenge_timeout", {
                        errorCode: "turnstile_timeout",
                        exhausted: true,
                      });
                    }}
                  />
                ) : null}

                {resolvedErrorMessage ? <InlineNotice tone="error">{resolvedErrorMessage}</InlineNotice> : null}

                <button type="submit" disabled={submitDisabled} className={primaryButtonClassName} style={{ boxShadow: "0 22px 38px var(--accent-soft)" }}>
                  {verificationActive
                    ? (submitting ? content.registerVerification.verifying : content.registerVerification.verifyAction)
                    : (submitting ? modeContent.submitting : modeContent.submit)}
                </button>
                {mode === "login" ? (
                  <>
                    <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted)]">
                      <span className="h-px flex-1 bg-[var(--line)]" />
                      <span>{content.providerDivider}</span>
                      <span className="h-px flex-1 bg-[var(--line)]" />
                    </div>
                    <button
                      type="button"
                      onClick={handleWatchaLogin}
                      disabled={watchaLoginDisabled}
                      className="site-watcha-login-button mx-auto flex min-h-11 w-fit max-w-full cursor-pointer items-center justify-center text-[0.8125rem] font-medium text-[var(--muted)] transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="site-watcha-login-target">
                        <Image src="/watcha-login-logo-round.png" alt="" width={32} height={32} className="h-7 w-7 shrink-0 rounded-full object-cover" />
                        <span className="site-watcha-login-label">{watchaRedirecting ? content.watchaLoginRedirecting : content.watchaLoginAction}</span>
                      </span>
                    </button>
                  </>
                ) : null}
                {verificationActive ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => void handleResendRegisterCode()} disabled={submitting} className={secondaryButtonClassName}>
                      {content.registerVerification.resendAction}
                    </button>
                    <button type="button" onClick={handleEditRegisterEmail} disabled={submitting} className={secondaryButtonClassName}>
                      {content.registerVerification.editAction}
                    </button>
                  </div>
                ) : null}
              </form>
            )}

            {!successState && !(viewerSession.authenticated && mode === "login") ? (
              <div className="mt-7 text-center text-sm text-[var(--muted)]">
                <span>{modeContent.footerLead} </span>
                {modeContent.footerAction ? (
                  <a href={footerHref} className={subtleLinkClassName}>
                    {modeContent.footerAction}
                  </a>
                ) : null}
              </div>
            ) : null}

            <p className="mt-6 text-center text-xs leading-6 text-[var(--muted)]">
              <span>{content.legalNoticeLead} </span>
              <a
                href={withLocaleQuery("/terms-of-service", locale)}
                className="font-medium text-[var(--accent-strong)] transition hover:opacity-80"
                target="_blank"
                rel="noreferrer"
              >
                {content.termsOfService}
              </a>
              <span> {content.legalNoticeJoin} </span>
              <a
                href={withLocaleQuery("/privacy", locale)}
                className="font-medium text-[var(--accent-strong)] transition hover:opacity-80"
                target="_blank"
                rel="noreferrer"
              >
                {content.privacyPolicy}
              </a>
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--muted)]">
              <a href={withAuthPageQuery("/", locale, null, null)} className="transition hover:text-[var(--foreground)]">
                {content.home}
              </a>
              {!effectiveClientRedirectUri ? (
                <a href={withAuthPageQuery("/", locale, null, null)} className="transition hover:text-[var(--foreground)]">
                  {content.download}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

type AuthFieldProps = {
  label: string;
  className?: string;
  labelActionHref?: string;
  labelActionLabel?: string;
  trailingControl?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

function BrandLockup() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/80 shadow-[0_12px_24px_rgba(15,20,35,0.08)] dark:bg-white/10">
        <Image src="/icon.svg" alt="" aria-hidden="true" width={32} height={32} className="block h-full w-full object-contain" />
      </span>
      <span className="leading-tight">
        <span className="display block text-[0.84rem] font-semibold tracking-[0.18em] text-[var(--accent-strong)] sm:text-[0.9rem]">MotiClaw</span>
      </span>
    </span>
  );
}

function AuthField({ label, className = "", ...inputProps }: AuthFieldProps) {
  const { labelActionHref, labelActionLabel, trailingControl, ...restProps } = inputProps;
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-[var(--foreground)]">
        <span>{label}</span>
        {labelActionHref && labelActionLabel ? (
          <a href={labelActionHref} className="text-xs font-medium text-[var(--accent-strong)] transition hover:opacity-80">
            {labelActionLabel}
          </a>
        ) : null}
      </span>
      <div className="relative">
        <input {...restProps} className={`${textFieldClassName} ${className}`.trim()} />
        {trailingControl ? <div className="absolute inset-y-0 right-3 flex items-center">{trailingControl}</div> : null}
      </div>
    </label>
  );
}

function VerificationCodeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] || "");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      <span
        className="relative grid grid-cols-6 gap-2 sm:gap-3"
        onClick={() => inputRef.current?.focus()}
      >
        {digits.map((digit, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`flex aspect-square min-w-0 items-center justify-center rounded-[0.9rem] border bg-[var(--surface-strong)] text-xl font-semibold tabular-nums text-[var(--foreground)] transition ${
              index === Math.min(value.length, 5)
                ? "border-[var(--accent)] ring-4 ring-[var(--accent-soft)]"
                : digit
                  ? "border-[var(--accent-strong)]"
                  : "border-[var(--line)]"
            }`}
          >
            {digit}
          </span>
        ))}
        <input
          ref={inputRef}
          name="verificationCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          maxLength={6}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </span>
    </label>
  );
}

function NoticeCard({ tone, className = "", children }: { tone: "success" | "neutral"; className?: string; children: ReactNode }) {
  const toneClassName = tone === "success"
    ? "border-emerald-500/18 bg-emerald-500/[0.08] dark:border-emerald-400/20 dark:bg-emerald-400/[0.1]"
    : "border-[var(--line)] bg-[var(--surface)]";

  return <div className={`${toneClassName} rounded-[1.6rem] border p-5 shadow-[0_24px_70px_rgba(9,12,24,0.14)] ${className}`.trim()}>{children}</div>;
}

function InlineNotice({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const toneClassName = tone === "success"
    ? "border-emerald-500/18 bg-emerald-500/[0.08] text-emerald-800 dark:border-emerald-300/18 dark:bg-emerald-400/[0.1] dark:text-emerald-100"
    : "border-rose-500/18 bg-rose-500/[0.08] text-rose-800 dark:border-rose-400/18 dark:bg-rose-400/[0.08] dark:text-rose-100";

  return <div className={`${toneClassName} rounded-[1.1rem] border px-4 py-3 text-sm leading-6`.trim()}>{children}</div>;
}

function DesktopReturnHelp({
  blocked,
  body,
  disabled,
  locale,
  onRetry,
  retryLabel,
  steps,
  title,
}: {
  blocked: boolean;
  body: string;
  disabled: boolean;
  locale: Locale;
  onRetry: () => void;
  retryLabel: string;
  steps: readonly string[];
  title: string;
}) {
  const toneClassName = blocked
    ? "border-amber-500/22 bg-amber-500/[0.08] text-amber-950 dark:border-amber-300/20 dark:bg-amber-300/[0.1] dark:text-amber-100"
    : "border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)]";

  return (
    <div className={`${toneClassName} mt-5 rounded-[1.2rem] border px-4 py-4`.trim()}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6">{body}</p>
      {steps.length > 0 ? (
        <ol className="mt-3 space-y-2 text-sm leading-6">
          {steps.map((step, index) => (
            <li key={`${locale}-${index}-${step}`} className="flex gap-3">
              <span className="mt-[0.15rem] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/18 text-[11px] font-semibold">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <button type="button" onClick={onRetry} disabled={disabled} className={`${secondaryButtonClassName} mt-4 w-full`}>
        {retryLabel}
      </button>
    </div>
  );
}

function validateClientInput(
  mode: SiteAuthPageMode,
  values: {
    email: string;
    registerStep: RegisterStep;
    loginStep: LoginStep;
    verificationCode: string;
    newPassword: string;
    resetToken: string;
  },
) {
  if (mode !== "reset-password" && !values.email.trim()) return "client_email_required";
  if (mode === "register" && values.registerStep === "verify") {
    if (!values.verificationCode.trim()) return "client_verification_code_required";
    return null;
  }
  if (mode === "login" && values.loginStep === "verify") {
    if (!values.verificationCode.trim()) return "client_verification_code_required";
    return null;
  }
  if (mode === "reset-password" && !values.newPassword.trim()) return "client_new_password_required";
  if (mode === "reset-password" && !values.resetToken.trim()) return "client_reset_token_required";
  if (mode === "reset-password" && values.newPassword.trim().length < 8) {
    return "auth_password_too_short";
  }
  return null;
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<ApiResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as ApiResult;
    if (!response.ok || payload.ok === false) {
      return {
        ok: false,
        error: payload.error || {
          code: `site_auth_http_${response.status}`,
          message: "",
          details: null,
          request_id: null,
          error_id: null,
        },
      };
    }
    return {
      ok: true,
      message: payload.message,
      previewResetUrl: payload.previewResetUrl,
      previewCode: payload.previewCode,
      clientRedirect: payload.clientRedirect || null,
      verification: payload.verification || null,
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "site_auth_http_502",
        details: null,
        request_id: null,
        error_id: null,
      },
    };
  }
}

function isTurnstileMode(mode: SiteAuthPageMode): mode is TurnstileMode {
  return mode === "login" || mode === "register" || mode === "forgot-password";
}

function isLoginRiskTurnstileRequired(error: ApiResult["error"] | undefined) {
  if (error?.code !== "turnstile_required") {
    return false;
  }
  const details = error.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return false;
  }
  return (details as Record<string, unknown>).reason === "login_risk";
}

async function queryDesktopReturnPermission(value: string): Promise<DesktopReturnPermissionState> {
  if (typeof window === "undefined" || !isLoopbackDesktopReturnUri(value) || !("permissions" in navigator)) {
    return "unsupported";
  }

  for (const name of ["loopback-network", "local-network-access"] as const) {
    try {
      const status = await navigator.permissions.query({ name: name as PermissionName });
      return status.state;
    } catch {
      continue;
    }
  }

  return "unsupported";
}

async function resolveDesktopReturnFailureCode(redirect: SiteAuthClientRedirect) {
  const loopbackAction = resolveLoopbackRedirectAction(redirect);
  if (!loopbackAction) return "desktop_return_failed";
  const permissionState = await queryDesktopReturnPermission(loopbackAction);
  return permissionState === "denied" ? "desktop_return_blocked" : "desktop_return_failed";
}

function withAuthPageQuery(
  path: string,
  locale: Locale,
  clientRedirectUri: string | null,
  fallbackRedirectUri: string | null,
  returnToPath: string | null = null,
) {
  const url = new URL(path, "https://www.moticlaw.com");
  url.searchParams.set("lang", locale);
  if (clientRedirectUri) {
    url.searchParams.set("client_redirect_uri", clientRedirectUri);
  }
  if (fallbackRedirectUri) {
    url.searchParams.set("fallback_redirect_uri", fallbackRedirectUri);
  }
  if (returnToPath) {
    url.searchParams.set("return_to", returnToPath);
  }
  return `${url.pathname}${url.search}`;
}

function buildWatchaOAuthHref(
  locale: Locale,
  clientRedirectUri: string | null,
  fallbackRedirectUri: string | null,
  returnToPath: string | null,
) {
  const url = new URL("/api/auth/oauth-watcha", "https://www.moticlaw.com");
  url.searchParams.set("lang", locale);
  if (clientRedirectUri) {
    url.searchParams.set("client_redirect_uri", clientRedirectUri);
  }
  if (fallbackRedirectUri) {
    url.searchParams.set("fallback_redirect_uri", fallbackRedirectUri);
  }
  if (returnToPath) {
    url.searchParams.set("return_to", returnToPath);
  }
  return `${url.pathname}${url.search}`;
}

function withLocaleQuery(path: string, locale: Locale) {
  const url = new URL(path, "https://www.moticlaw.com");
  url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}`;
}

function persistRememberedDesktopReturnContext(
  clientRedirectUri: string,
  fallbackRedirectUri: string | null,
): DesktopReturnContext | null {
  const nextContext = normalizeRememberedDesktopReturnContext({
    clientRedirectUri,
    fallbackRedirectUri,
    updatedAt: Date.now(),
  }, Date.now(), rememberedDesktopReturnContextTtlMs);

  if (typeof window !== "undefined") {
    try {
      if (nextContext) {
        window.localStorage.setItem(rememberedDesktopReturnContextStorageKey, JSON.stringify(nextContext));
      } else {
        window.localStorage.removeItem(rememberedDesktopReturnContextStorageKey);
      }
    } catch {}
  }

  return nextContext;
}

function readRememberedDesktopReturnContext(): DesktopReturnContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(rememberedDesktopReturnContextStorageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const context = normalizeRememberedDesktopReturnContext(parsed, Date.now(), rememberedDesktopReturnContextTtlMs);
    if (!context) {
      clearRememberedDesktopReturnContext();
      return null;
    }
    return context;
  } catch {
    clearRememberedDesktopReturnContext();
    return null;
  }
}

function clearRememberedDesktopReturnContext() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(rememberedDesktopReturnContextStorageKey);
  } catch {}
}

async function submitLoopbackFormRedirect(redirect: SiteAuthClientRedirect) {
  if (typeof document === "undefined" || !isLoopbackDesktopReturnUri(redirect.action)) return false;
  const transferStarted = waitForDesktopReturnTransferStart();
  const form = document.createElement("form");
  form.method = "POST";
  form.action = redirect.action;
  form.acceptCharset = "utf-8";
  form.style.display = "none";
  for (const [name, value] of Object.entries(redirect.fields || {})) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  const started = await transferStarted;
  if (!started && form.isConnected) {
    form.remove();
  }
  return started;
}

function resolveLoopbackRedirect(redirect: SiteAuthClientRedirect | null) {
  if (!redirect) return null;
  if (redirect.method === "post" && isLoopbackDesktopReturnUri(redirect.action)) {
    return redirect;
  }
  if (redirect.fallback && redirect.fallback.method === "post" && isLoopbackDesktopReturnUri(redirect.fallback.action)) {
    return redirect.fallback;
  }
  return null;
}

function resolveLoopbackRedirectAction(redirect: SiteAuthClientRedirect | null) {
  return resolveLoopbackRedirect(redirect)?.action || null;
}

function isUnsupportedNonLoopbackDesktopReturn(redirect: SiteAuthClientRedirect | null) {
  return Boolean(redirect && redirect.method === "post" && !isLoopbackDesktopReturnUri(redirect.action));
}

function redirectSummary(redirect: SiteAuthClientRedirect) {
  try {
    const url = new URL(redirect.action);
    return {
      action: `${url.protocol}//${url.host}${url.pathname}`,
      method: redirect.method,
      hasFallback: Boolean(redirect.fallback),
    };
  } catch {
    return {
      action: "invalid://redirect",
      method: redirect.method,
      hasFallback: Boolean(redirect.fallback),
    };
  }
}

function logDesktopReturnEvent(
  event: string,
  redirect: SiteAuthClientRedirect,
  extra: {
    detail?: string;
    errorCode?: string;
    loopbackPermission?: DesktopReturnPermissionState;
  } = {},
) {
  void fetch("/api/auth/event", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    keepalive: true,
    body: JSON.stringify({
      event,
      mode: "desktop-return",
      detail: extra.detail,
      errorCode: extra.errorCode,
      loopbackPermission: extra.loopbackPermission,
      visibilityState: typeof document === "undefined" ? null : document.visibilityState,
      redirect: redirectSummary(redirect),
    }),
  }).catch(() => null);
}

function waitForNativeDesktopReturnCooldown(timeoutMs = nativeDesktopReturnCooldownMs) {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

function waitForDesktopReturnTransferStart(timeoutMs = 400) {
  if (typeof window === "undefined") return Promise.resolve(false);
  return new Promise<boolean>((resolve) => {
    let finished = false;
    const finish = (value: boolean) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(value);
    };
    const onBlur = () => finish(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        finish(true);
      }
    };
    const onBeforeUnload = () => finish(true);
    const onPageHide = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    window.addEventListener("blur", onBlur, { once: true });
    window.addEventListener("beforeunload", onBeforeUnload, { once: true });
    window.addEventListener("pagehide", onPageHide, { once: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
  });
}
