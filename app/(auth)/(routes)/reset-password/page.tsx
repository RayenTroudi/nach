"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const router = useRouter();
  const locale = useLocale();
  const { signIn, setActive } = useSignIn();
  const searchParams = useSearchParams();

  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    // Check if email is passed from forgot-password page
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Automatically send code if email is provided
      handleSendCodeAutomatically(emailParam);
    }
  }, [searchParams]);

  const handleSendCodeAutomatically = async (emailAddress: string) => {
    setLoading(true);
    setError("");

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setStep("code");
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          (locale === "ar"
            ? "فشل إرسال رمز التحقق"
            : locale === "de"
            ? "Fehler beim Senden des Bestätigungscodes"
            : "Failed to send verification code")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("code");
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          (locale === "ar"
            ? "فشل إرسال رمز التحقق"
            : locale === "de"
            ? "Fehler beim Senden des Bestätigungscodes"
            : "Failed to send verification code")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
      });

      if (result?.status === "needs_new_password") {
        setStep("password");
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          (locale === "ar"
            ? "رمز التحقق غير صحيح"
            : locale === "de"
            ? "Ungültiger Bestätigungscode"
            : "Invalid verification code")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(
        locale === "ar"
          ? "كلمات المرور غير متطابقة"
          : locale === "de"
          ? "Passwörter stimmen nicht überein"
          : "Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        locale === "ar"
          ? "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل"
          : locale === "de"
          ? "Das Passwort muss mindestens 8 Zeichen lang sein"
          : "Password must be at least 8 characters"
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
        password: newPassword,
      });

      if (result?.status === "complete" && result.createdSessionId) {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }
        
        // Send confirmation email
        try {
          await fetch("/api/auth/password-changed", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to send confirmation email:", emailErr);
        }

        setSuccess(true);
        
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError(
          locale === "ar"
            ? "فشل إعادة تعيين كلمة المرور"
            : locale === "de"
            ? "Passwort-Reset fehlgeschlagen"
            : "Password reset failed"
        );
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(
        err.errors?.[0]?.message ||
          (locale === "ar"
            ? "فشل تحديث كلمة المرور"
            : locale === "de"
            ? "Passwort konnte nicht aktualisiert werden"
            : "Failed to update password")
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto" dir={direction}>
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {locale === "ar"
                  ? "تم تحديث كلمة المرور"
                  : locale === "de"
                  ? "Passwort aktualisiert"
                  : "Password Updated"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {locale === "ar"
                  ? "تم تحديث كلمة المرور بنجاح. سيتم توجيهك إلى لوحة التحكم..."
                  : locale === "de"
                  ? "Ihr Passwort wurde erfolgreich aktualisiert. Sie werden zum Dashboard weitergeleitet..."
                  : "Your password has been successfully updated. Redirecting to dashboard..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "email") {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto" dir={direction}>
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red-500 mx-auto mb-4"></div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {locale === "ar"
                    ? "إرسال رمز التحقق..."
                    : locale === "de"
                    ? "Bestätigungscode wird gesendet..."
                    : "Sending verification code..."}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {locale === "ar"
                    ? "يتم إرسال رمز التحقق إلى بريدك الإلكتروني"
                    : locale === "de"
                    ? "Ein Bestätigungscode wird an Ihre E-Mail gesendet"
                    : "A verification code is being sent to your email"}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {locale === "ar"
                      ? "إعادة تعيين كلمة المرور"
                      : locale === "de"
                      ? "Passwort zurücksetzen"
                      : "Reset Password"}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {locale === "ar"
                      ? "أدخل عنوان بريدك الإلكتروني لتلقي رمز التحقق"
                      : locale === "de"
                      ? "Geben Sie Ihre E-Mail-Adresse ein, um einen Bestätigungscode zu erhalten"
                      : "Enter your email address to receive a verification code"}
                  </p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 block text-sm"
                    >
                      {locale === "ar"
                        ? "البريد الإلكتروني"
                        : locale === "de"
                        ? "E-Mail"
                        : "Email"}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      dir="ltr"
                      className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 w-full text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 w-full text-sm disabled:opacity-50"
                  >
                    {locale === "ar"
                      ? "إرسال الرمز"
                      : locale === "de"
                      ? "Code senden"
                      : "Send Code"}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/sign-in"
                      className="text-brand-red-500 hover:text-brand-red-600 text-sm"
                    >
                      {locale === "ar"
                        ? "العودة لتسجيل الدخول"
                        : locale === "de"
                        ? "Zurück zur Anmeldung"
                        : "Back to Sign In"}
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md mx-auto" dir={direction}>
          <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {locale === "ar"
                  ? "تأكيد الرمز"
                  : locale === "de"
                  ? "Code bestätigen"
                  : "Verify Code"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {locale === "ar"
                  ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني. أدخل الرمز أدناه."
                  : locale === "de"
                  ? "Ein Bestätigungscode wurde an Ihre E-Mail gesendet. Geben Sie den Code unten ein."
                  : "A verification code has been sent to your email. Enter the code below."}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4" dir="ltr">
                {email}
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="code"
                  className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 block text-sm"
                >
                  {locale === "ar"
                    ? "رمز التحقق"
                    : locale === "de"
                    ? "Bestätigungscode"
                    : "Verification Code"}
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  dir="ltr"
                  className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 w-full text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 w-full text-sm disabled:opacity-50"
              >
                {loading
                  ? locale === "ar"
                    ? "جارٍ التحقق..."
                    : locale === "de"
                    ? "Überprüfung..."
                    : "Verifying..."
                  : locale === "ar"
                  ? "تحقق من الرمز"
                  : locale === "de"
                  ? "Code überprüfen"
                  : "Verify Code"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // step === "password"
  return (
    <div className="w-full flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md mx-auto" dir={direction}>
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {locale === "ar"
                ? "تعيين كلمة مرور جديدة"
                : locale === "de"
                ? "Neues Passwort festlegen"
                : "Set New Password"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {locale === "ar"
                ? "أدخل كلمة المرور الجديدة لحسابك"
                : locale === "de"
                ? "Geben Sie ein neues Passwort für Ihr Konto ein"
                : "Enter a new password for your account"}
            </p>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 block text-sm"
              >
                {locale === "ar"
                  ? "كلمة المرور الجديدة"
                  : locale === "de"
                  ? "Neues Passwort"
                  : "New Password"}
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 w-full text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-slate-700 dark:text-slate-300 font-medium mb-1.5 block text-sm"
              >
                {locale === "ar"
                  ? "تأكيد كلمة المرور"
                  : locale === "de"
                  ? "Passwort bestätigen"
                  : "Confirm Password"}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 w-full text-sm disabled:opacity-50"
            >
              {loading
                ? locale === "ar"
                  ? "جارٍ التحديث..."
                  : locale === "de"
                  ? "Aktualisierung..."
                  : "Updating..."
                : locale === "ar"
                ? "تحديث كلمة المرور"
                : locale === "de"
                ? "Passwort aktualisieren"
                : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
