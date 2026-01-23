/**
 * Add Missing Arabic Translations
 * Adds translations that exist in EN/DE but missing in AR
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationMap {
  [key: string]: string;
}

// Additional Arabic translations for keys that were only in EN/DE
const arabicTranslations: TranslationMap = {
  "dashboard.admin.resumes.view": "عرض",
  "dashboard.admin.resumes.viewDetails": "عرض التفاصيل",
  "dashboard.admin.resumes.viewFullSize": "عرض بالحجم الكامل",
  
  "dashboard.student.meeting.book": "حجز",
  "dashboard.student.meeting.bookConsultation": "حجز استشارة",
  "dashboard.student.meeting.bookingAwaitingPayment": "الحجز بانتظار الموافقة على الدفع",
  "dashboard.student.meeting.bookingCancelled": "تم إلغاء الحجز",
  "dashboard.student.meeting.bookingCancelledDesc": "تم إلغاء حجزك",
  "dashboard.student.meeting.bookingCompleted": "اكتمل الاجتماع",
  "dashboard.student.meeting.bookingDetails": "تفاصيل الحجز",
  "dashboard.student.meeting.bookingSuccess": "نجح الحجز",
  "dashboard.student.meeting.bookingSuccessDesc": "تم حجز استشارتك بنجاح",
  "dashboard.student.meeting.cancel": "إلغاء",
  "dashboard.student.meeting.cancelBooking": "إلغاء الحجز",
  "dashboard.student.meeting.confirmationMessage": "سنراجع إثبات الدفع الخاص بك ونرسل لك رابط الاجتماع عبر البريد الإلكتروني بمجرد الموافقة عليه.",
  "dashboard.student.meeting.consultationWith": "استشارة مع {name}",
  "dashboard.student.meeting.continue": "متابعة",
  "dashboard.student.meeting.date": "التاريخ",
  "dashboard.student.meeting.duration": "المدة",
  "dashboard.student.meeting.errorBooking": "فشل في إنشاء الحجز",
  "dashboard.student.meeting.errorCancelling": "فشل في إلغاء الحجز",
  "dashboard.student.meeting.errorTitle": "خطأ",
  "dashboard.student.meeting.free": "مجاني",
  "dashboard.student.meeting.joinMeeting": "انضم للاجتماع",
  "dashboard.student.meeting.meetingLink": "رابط الاجتماع",
  "dashboard.student.meeting.myBookings": "حجوزاتي",
  "dashboard.student.meeting.noAvailability": "لم يتم العثور على مواعيد متاحة",
  "dashboard.student.meeting.noBookingsDesc": "لم تحجز أي استشارات بعد",
  "dashboard.student.meeting.noBookingsFound": "لا توجد حجوزات",
  "dashboard.student.meeting.notes": "ملاحظات",
  "dashboard.student.meeting.notesOptional": "ملاحظات (اختياري)",
  "dashboard.student.meeting.notesPlaceholder": "أضف أي مواضيع أو أسئلة محددة تريد مناقشتها...",
  "dashboard.student.meeting.paymentAwaitingApproval": "الدفع بانتظار الموافقة",
  "dashboard.student.meeting.paymentInfo": "معلومات الدفع",
  "dashboard.student.meeting.paymentMethod": "طريقة الدفع",
  "dashboard.student.meeting.paymentProof": "إثبات الدفع",
  "dashboard.student.meeting.paymentProofRequired": "يرجى تحميل إثبات الدفع",
  "dashboard.student.meeting.paymentRejected": "تم رفض الدفع",
  "dashboard.student.meeting.price": "السعر",
  "dashboard.student.meeting.rejectionReason": "سبب الرفض",
  "dashboard.student.meeting.selectDateTime": "اختر التاريخ والوقت",
  "dashboard.student.meeting.selectTimeSlot": "اختر فترة زمنية",
  "dashboard.student.meeting.status": "الحالة",
  "dashboard.student.meeting.subtitle": "جدولة وإدارة جلسات الاستشارة الخاصة بك",
  "dashboard.student.meeting.time": "الوقت",
  "dashboard.student.meeting.timezone": "المنطقة الزمنية",
  "dashboard.student.meeting.title": "حجز استشارة",
  "dashboard.student.meeting.uploadPaymentProof": "تحميل إثبات الدفع",
  "dashboard.student.meeting.view": "عرض",
  "dashboard.student.meeting.viewDetails": "عرض التفاصيل",
  
  "dashboard.student.resume.additionalNotes": "ملاحظات إضافية",
  "dashboard.student.resume.additionalNotesPlaceholder": "أي معلومات إضافية...",
  "dashboard.student.resume.completed": "مكتمل",
  "dashboard.student.resume.confirmPayment": "تأكيد الدفع",
  "dashboard.student.resume.currentCV": "السيرة الذاتية الحالية",
  "dashboard.student.resume.currentCVOptional": "السيرة الذاتية الحالية (اختياري)",
  "dashboard.student.resume.currentRole": "الدور الحالي",
  "dashboard.student.resume.download": "تحميل",
  "dashboard.student.resume.downloadResume": "تحميل السيرة الذاتية",
  "dashboard.student.resume.education": "التعليم",
  "dashboard.student.resume.errorTitle": "خطأ",
  "dashboard.student.resume.experience": "الخبرة (بالسنوات)",
  "dashboard.student.resume.myRequests": "طلبات السيرة الذاتية الخاصة بي",
  "dashboard.student.resume.noRequestsDesc": "لم تطلب أي خدمات سيرة ذاتية بعد",
  "dashboard.student.resume.noRequestsFound": "لا توجد طلبات",
  "dashboard.student.resume.paymentProof": "إثبات الدفع",
  "dashboard.student.resume.paymentProofRequired": "يرجى تحميل إثبات الدفع",
  "dashboard.student.resume.pendingPayment": "الدفع قيد الانتظار",
  "dashboard.student.resume.price": "السعر: {price} دينار تونسي",
  "dashboard.student.resume.requestCreatedDesc": "تم تقديم طلب السيرة الذاتية الخاص بك",
  "dashboard.student.resume.requestFailed": "فشل في تقديم الطلب",
  "dashboard.student.resume.requestSuccess": "تم تقديم الطلب",
  "dashboard.student.resume.skills": "المهارات",
  "dashboard.student.resume.skillsPlaceholder": "مثلاً، JavaScript، React، Node.js",
  "dashboard.student.resume.status": "الحالة",
  "dashboard.student.resume.submitRequest": "تقديم الطلب",
  "dashboard.student.resume.subtitle": "احصل على سيرة ذاتية مصممة بشكل احترافي مصممة لدورك المستهدف",
  "dashboard.student.resume.targetRole": "الدور المستهدف",
  "dashboard.student.resume.title": "خدمة السيرة الذاتية",
  "dashboard.student.resume.uploadCV": "تحميل السيرة الذاتية",
  "dashboard.student.resume.uploadPaymentProof": "تحميل إثبات الدفع",
  "dashboard.student.resume.view": "عرض",
  "dashboard.student.resume.viewDetails": "عرض التفاصيل",
  "dashboard.student.resume.yourInformation": "معلوماتك"
};

function addArabicTranslations() {
  console.log('🔧 Adding missing Arabic translations...\n');
  
  const arPath = path.join(MESSAGES_DIR, 'ar.json');
  const arContent = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
  
  let added = 0;
  
  for (const [key, value] of Object.entries(arabicTranslations)) {
    const keys = key.split('.');
    
    let current: any = arContent;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    if (!current[keys[keys.length - 1]]) {
      current[keys[keys.length - 1]] = value;
      added++;
    }
  }
  
  // Write back with proper formatting
  fs.writeFileSync(arPath, JSON.stringify(arContent, null, 2) + '\n');
  
  console.log(`✅ Added ${added} translations to AR`);
  console.log(`📊 Total translations in map: ${Object.keys(arabicTranslations).length}\n`);
  
  return added;
}

if (require.main === module) {
  addArabicTranslations();
}

export { addArabicTranslations, arabicTranslations };
