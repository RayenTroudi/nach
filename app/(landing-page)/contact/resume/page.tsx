"use client";

import { useState } from "react";
import { Container } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/shared/FileUpload";
import MeetingPayment from "@/components/shared/MeetingPayment";
import { MessageSquare, Clock, CheckCircle2, FileText, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ResumeRequestPage() {
  const t = useTranslations('contact.resume');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentRole: "",
    targetRole: "",
    experience: "",
    education: "",
    skills: "",
    additionalInfo: "",
    documentUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(t('errors.requiredFields'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/resume-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestId(data.resumeRequest._id);
        setShowPayment(true);
        toast.success(t('success.requestCreated'));
      } else {
        toast.error(data.error || t('errors.submitFailed'));
      }
    } catch (error) {
      toast.error(t('errors.somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      currentRole: "",
      targetRole: "",
      experience: "",
      education: "",
      skills: "",
      additionalInfo: "",
      documentUrl: "",
    });
    setRequestId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Container className="py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-red-500 dark:hover:text-brand-red-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('backToHome')}
        </Link>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-slate-950 dark:text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-green-600" />
                {t('completePayment')}
              </DialogTitle>
            </DialogHeader>
            {requestId && (
              <MeetingPayment
                bookingId={requestId}
                amount={49}
                onSuccess={handlePaymentSuccess}
                apiEndpoint="/api/resume-payment"
              />
            )}
          </DialogContent>
        </Dialog>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-950 dark:text-white mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-950 dark:text-white mb-1">{t('features.turnaroundTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('features.turnaroundDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-950 dark:text-white mb-1">{t('features.standardsTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('features.standardsDesc')}</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-950 dark:text-white mb-1">{t('features.reviewTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('features.reviewDesc')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-b-2 border-slate-200 dark:border-slate-800">
              <CardTitle className="text-2xl text-slate-950 dark:text-white">{t('formTitle')}</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('formDescription')}</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('personalInfo')}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.fullName')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={t('form.fullNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.email')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder={t('form.emailPlaceholder')}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        dir="ltr"
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.phone')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder={t('form.phonePlaceholder')}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      dir="ltr"
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('professionalDetails')}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.currentRole')}
                      </label>
                      <Input
                        placeholder={t('form.currentRolePlaceholder')}
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.targetRole')}
                      </label>
                      <Input
                        placeholder={t('form.targetRolePlaceholder')}
                        value={formData.targetRole}
                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.experience')}
                    </label>
                    <Textarea
                      placeholder={t('form.experiencePlaceholder')}
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      rows={4}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.education')}
                    </label>
                    <Textarea
                      placeholder={t('form.educationPlaceholder')}
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      rows={3}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.skills')}
                    </label>
                    <Textarea
                      placeholder={t('form.skillsPlaceholder')}
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      rows={3}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('supportingDocuments')}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.uploadCV')}
                    </label>
                    {formData.documentUrl ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{t('form.documentUploaded')}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, documentUrl: "" })}
                          className="text-xs"
                        >
                          {t('form.remove')}
                        </Button>
                      </div>
                    ) : (
                      <FileUpload
                        endpoint="documentUpload"
                        onChange={(url) => setFormData({ ...formData, documentUrl: url || "" })}
                      />
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {t('form.acceptedFormats')}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t('form.additionalInfo')}
                  </label>
                  <Textarea
                    placeholder={t('form.additionalInfoPlaceholder')}
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                    rows={4}
                    className="border-2 border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Service Fee Notice */}
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-slate-950 dark:text-white">{t('serviceFee')}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t('paymentRequired')}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">{t('price')}</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('submitting')}
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        {t('continueToPayment')}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                  {t('termsNotice')}
                </p>
              </form>
            </CardContent>
          </Card>

          {/* What You'll Get */}
          <Card className="mt-8 border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950 dark:text-white">{t('whatYoullReceive')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{t('includes.germanCV')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{t('includes.motivationLetter')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{t('includes.atsOptimized')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{t('includes.review')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{t('includes.revisions')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
