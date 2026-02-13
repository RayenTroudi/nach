"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    // If user is not signed in after the component loads, redirect to sign-in
    if (isLoaded && !isSignedIn) {
      const ticket = searchParams?.get("__clerk_ticket");
      if (ticket) {
        // If there's a ticket in the URL, go to sign-in to process it
        router.push(`/sign-in?__clerk_ticket=${ticket}&redirect_url=/reset-password`);
      } else {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, isSignedIn, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!user) {
      setError(
        locale === "ar"
          ? "يجب عليك تسجيل الدخول أولاً"
          : locale === "de"
          ? "Sie müssen zuerst angemeldet sein"
          : "You must be signed in first"
      );
      return;
    }

    setLoading(true);

    try {
      await user.updatePassword({
        newPassword: newPassword,
        signOutOfOtherSessions: true,
      });

      // Send confirmation email via Resend
      try {
        await fetch("/api/auth/password-changed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
        // Don't fail the password update if email fails
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      console.error("Password update error:", err);
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

  if (!isLoaded) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect in useEffect
  }

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
                  ? "تم تحديث كلمة المرور بنجاح. جارٍ إعادة التوجيه..."
                  : locale === "de"
                  ? "Ihr Passwort wurde erfolgreich aktualisiert. Weiterleitung..."
                  : "Your password has been successfully updated. Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleSubmit} className="space-y-3">
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
                placeholder={
                  locale === "ar"
                    ? "8 أحرف على الأقل"
                    : locale === "de"
                    ? "Mindestens 8 Zeichen"
                    : "At least 8 characters"
                }
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
                placeholder={
                  locale === "ar"
                    ? "أعد إدخال كلمة المرور"
                    : locale === "de"
                    ? "Passwort erneut eingeben"
                    : "Re-enter password"
                }
                className="border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-brand-red-500 focus:border-brand-red-500 w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-red-500 hover:bg-brand-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 w-full block text-center mt-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-brand-red-500 hover:text-brand-red-600 text-sm"
              >
                {locale === "ar"
                  ? "إلغاء"
                  : locale === "de"
                  ? "Abbrechen"
                  : "Cancel"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
