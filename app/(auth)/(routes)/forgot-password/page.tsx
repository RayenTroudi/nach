"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Redirect directly to reset-password page with email
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  const direction = locale === "ar" ? "rtl" : "ltr";

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
                ? "أدخل بريدك الإلكتروني لبدء عملية إعادة تعيين كلمة المرور"
                : locale === "de"
                ? "Geben Sie Ihre E-Mail-Adresse ein, um mit der Passwort-Zurücksetzung zu beginnen"
                : "Enter your email to start the password reset process"}
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
                ? (locale === "ar" ? "جارٍ التوجيه..." : locale === "de" ? "Weiterleitung..." : "Redirecting...")
                : (locale === "ar" ? "متابعة" : locale === "de" ? "Fortfahren" : "Continue")
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
