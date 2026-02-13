"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const direction = locale === "ar" ? "rtl" : "ltr";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="w-full max-w-md" dir={direction}>
          <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {locale === "ar" ? "تم إرسال البريد الإلكتروني" : locale === "de" ? "E-Mail gesendet" : "Email Sent"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {locale === "ar" 
                  ? "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور"
                  : locale === "de"
                  ? "Überprüfen Sie Ihre E-Mail für den Link zum Zurücksetzen des Passworts"
                  : "Check your email for the password reset link"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {locale === "ar" 
                    ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى:"
                    : locale === "de"
                    ? "Der Link zum Zurücksetzen des Passworts wurde gesendet an:"
                    : "A password reset link has been sent to:"}
                </p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-1" dir="ltr">
                  {email}
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {locale === "ar" 
                  ? "انقر على الرابط في البريد الإلكتروني لإعادة تعيين كلمة المرور الخاصة بك. الرابط صالح لمدة 24 ساعة."
                  : locale === "de"
                  ? "Klicken Sie auf den Link in der E-Mail, um Ihr Passwort zurückzusetzen. Der Link ist 24 Stunden gültig."
                  : "Click the link in the email to reset your password. The link is valid for 24 hours."}
              </p>

              <Link
                href="/sign-in"
                className="block w-full text-center bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                {locale === "ar" ? "العودة لتسجيل الدخول" : locale === "de" ? "Zurück zur Anmeldung" : "Back to Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md" dir={direction}>
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {locale === "ar" ? "نسيت كلمة المرور؟" : locale === "de" ? "Passwort vergessen?" : "Forgot Password?"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {locale === "ar" 
                ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور"
                : locale === "de"
                ? "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen"
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {locale === "ar" ? "البريد الإلكتروني" : locale === "de" ? "E-Mail" : "Email Address"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder={locale === "ar" ? "بريدك الإلكتروني" : locale === "de" ? "Ihre E-Mail" : "your@email.com"}
                className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading 
                ? (locale === "ar" ? "جارٍ الإرسال..." : locale === "de" ? "Senden..." : "Sending...")
                : (locale === "ar" ? "إرسال رابط إعادة التعيين" : locale === "de" ? "Link senden" : "Send Reset Link")
              }
            </button>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="text-brand-red-500 hover:text-brand-red-600 font-medium text-sm"
              >
                {locale === "ar" ? "العودة لتسجيل الدخول" : locale === "de" ? "Zurück zur Anmeldung" : "Back to Sign In"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
