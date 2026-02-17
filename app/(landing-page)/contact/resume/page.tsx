"use client";

import { useState, useEffect } from "react";
import { Container, Spinner } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/shared/FileUpload";
import MeetingPayment from "@/components/shared/MeetingPayment";
import { MessageSquare, Clock, CheckCircle2, FileText, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "resumeFormData";

export default function ResumeRequestPage() {
  const t = useTranslations('contact.resume');
  const locale = useLocale();
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    desiredTraining: "",
    lastName: "",
    firstName: "",
    email: "",
    birthDate: "",
    address: "",
    phone: "",
    driverLicense: "",
    germanLevel: "",
    frenchLevel: "",
    englishLevel: "",
    hasBac: "",
    bacObtainedDate: "",
    bacStudiedDate: "",
    bacSection: "",
    bacHighSchool: "",
    bacCity: "",
    postBacStudies: "",
    internships: "",
    trainings: "",
    professionalExperience: "",
    additionalInfo: "",
    documentUrl: "",
  });

  // Load saved form data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData(parsedData);
          toast.info(t('formRestored') || "Your form data has been restored");
          // Clear the saved data after loading
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Error loading saved form data:", error);
        }
      }
    }
  }, [t]);

  const saveFormDataToStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error(t('errors.requiredFields'));
      return;
    }

    // Check if user is authenticated
    if (!isLoaded) {
      toast.error(t('errors.loading') || "Loading...");
      return;
    }

    if (!userId) {
      // Save form data and show auth dialog
      saveFormDataToStorage();
      setShowAuthDialog(true);
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
    // Clear form data
    setFormData({
      desiredTraining: "",
      lastName: "",
      firstName: "",
      email: "",
      birthDate: "",
      address: "",
      phone: "",
      driverLicense: "",
      germanLevel: "",
      frenchLevel: "",
      englishLevel: "",
      hasBac: "",
      bacObtainedDate: "",
      bacStudiedDate: "",
      bacSection: "",
      bacHighSchool: "",
      bacCity: "",
      postBacStudies: "",
      internships: "",
      trainings: "",
      professionalExperience: "",
      additionalInfo: "",
      documentUrl: "",
    });
    setRequestId(null);
    // Clear any saved data in storage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-20">
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
                amount={100}
                onSuccess={handlePaymentSuccess}
                apiEndpoint="/api/resume-payment"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Authentication Dialog */}
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl text-slate-950 dark:text-white text-center">
                {t('authRequired')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-center text-slate-600 dark:text-slate-400">
                {t('authMessage')}
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowAuthDialog(false);
                    toast.info(t('formSaved') || "Your form data has been saved.");
                    router.push("/sign-up?redirect=/contact/resume");
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-semibold"
                >
                  {t('signUpButton')}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">
                      {t('or') || 'or'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setShowAuthDialog(false);
                    toast.info(t('formSaved') || "Your form data has been saved.");
                    router.push("/sign-in?redirect=/contact/resume");
                  }}
                  variant="outline"
                  className="w-full border-2 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 py-6 text-lg font-semibold"
                >
                  {t('signInButton') || t('signInLink')}
                </Button>
                
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                  {t('formWillBeSaved') || "Your form data will be saved and restored after you sign in."}
                </p>
              </div>
            </div>
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
                {/* Training Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('trainingSelection')}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.desiredTraining')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder={t('form.desiredTrainingPlaceholder')}
                      value={formData.desiredTraining}
                      onChange={(e) => setFormData({ ...formData, desiredTraining: e.target.value })}
                      required
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('personalInfo')}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.lastName')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={t('form.lastNamePlaceholder')}
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.firstName')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={t('form.firstNamePlaceholder')}
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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

                    <div>
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.birthDate')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                        dir="ltr"
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.address')} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder={t('form.addressPlaceholder')}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.driverLicense')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          checked={formData.driverLicense === "yes"}
                          onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                          required
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{t('form.yes')}</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          checked={formData.driverLicense === "no"}
                          onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                          required
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{t('form.no')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Language Levels */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('languageLevels')}
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.germanLevel')}
                      </label>
                      <select
                        value={formData.germanLevel}
                        onChange={(e) => setFormData({ ...formData, germanLevel: e.target.value })}
                        className="w-full border-2 border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">{t('form.selectLevel')}</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.frenchLevel')}
                      </label>
                      <select
                        value={formData.frenchLevel}
                        onChange={(e) => setFormData({ ...formData, frenchLevel: e.target.value })}
                        className="w-full border-2 border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">{t('form.selectLevel')}</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.englishLevel')}
                      </label>
                      <select
                        value={formData.englishLevel}
                        onChange={(e) => setFormData({ ...formData, englishLevel: e.target.value })}
                        className="w-full border-2 border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">{t('form.selectLevel')}</option>
                        <option value="A1">A1</option>
                        <option value="A2">A2</option>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education - Baccalaureate */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('bacEducation')}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.hasBac')} <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="yes"
                          checked={formData.hasBac === "yes"}
                          onChange={(e) => setFormData({ ...formData, hasBac: e.target.value })}
                          required
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{t('form.yes')}</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          value="no"
                          checked={formData.hasBac === "no"}
                          onChange={(e) => setFormData({ ...formData, hasBac: e.target.value })}
                          required
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{t('form.no')}</span>
                      </label>
                    </div>
                  </div>

                  {formData.hasBac === "yes" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('form.bacObtainedDate')}
                        </label>
                        <Input
                          type="date"
                          value={formData.bacObtainedDate}
                          onChange={(e) => setFormData({ ...formData, bacObtainedDate: e.target.value })}
                          dir="ltr"
                          className="border-2 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  {formData.hasBac === "no" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('form.bacStudiedDate')}
                        </label>
                        <Input
                          type="date"
                          value={formData.bacStudiedDate}
                          onChange={(e) => setFormData({ ...formData, bacStudiedDate: e.target.value })}
                          dir="ltr"
                          className="border-2 border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.bacSection')}
                      </label>
                      <Input
                        placeholder={t('form.bacSectionPlaceholder')}
                        value={formData.bacSection}
                        onChange={(e) => setFormData({ ...formData, bacSection: e.target.value })}
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {t('form.bacHighSchool')}
                      </label>
                      <Input
                        placeholder={t('form.bacHighSchoolPlaceholder')}
                        value={formData.bacHighSchool}
                        onChange={(e) => setFormData({ ...formData, bacHighSchool: e.target.value })}
                        className="border-2 border-slate-200 dark:border-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.bacCity')}
                    </label>
                    <Input
                      placeholder={t('form.bacCityPlaceholder')}
                      value={formData.bacCity}
                      onChange={(e) => setFormData({ ...formData, bacCity: e.target.value })}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Post-Bac Studies & Experience */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('postBacExperience')}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.postBacStudies')}
                    </label>
                    <Textarea
                      placeholder={t('form.postBacStudiesPlaceholder')}
                      value={formData.postBacStudies}
                      onChange={(e) => setFormData({ ...formData, postBacStudies: e.target.value })}
                      rows={3}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.internships')}
                    </label>
                    <Textarea
                      placeholder={t('form.internshipsPlaceholder')}
                      value={formData.internships}
                      onChange={(e) => setFormData({ ...formData, internships: e.target.value })}
                      rows={3}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.trainings')}
                    </label>
                    <Textarea
                      placeholder={t('form.trainingsPlaceholder')}
                      value={formData.trainings}
                      onChange={(e) => setFormData({ ...formData, trainings: e.target.value })}
                      rows={3}
                      className="border-2 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2">
                    {t('professionalDetails')}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('form.professionalExperience')}
                    </label>
                    <Textarea
                      placeholder={t('form.professionalExperiencePlaceholder')}
                      value={formData.professionalExperience}
                      onChange={(e) => setFormData({ ...formData, professionalExperience: e.target.value })}
                      rows={4}
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
                      <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-2">{t('offerIncludes')}</p>
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
                      <Spinner size={20} className="text-white" />
                    ) : (
                      <>
                        <Upload className={`w-5 h-5 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
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
