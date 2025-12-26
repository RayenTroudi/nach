# 🌐 Translation Task List - Incremental Implementation

> **Current Status:** 85-90% Translated | Target: 100%  
> **Last Updated:** December 26, 2025

---

## 📊 Quick Stats

| Priority | Tasks | Estimated Time | Impact |
|----------|-------|----------------|--------|
| 🔴 **HIGH** | 12 tasks | 3-4 hours | Critical user flows |
| 🟡 **MEDIUM** | 8 tasks | 2-3 hours | Enhanced UX |
| 🟢 **LOW** | 6 tasks | 2-3 hours | Nice to have |
| **TOTAL** | **26 tasks** | **7-10 hours** | Complete coverage |

---

## 🔴 HIGH PRIORITY (Critical User-Facing)

### ✅ Task 1: Contact Form Pages
**Impact:** Direct user engagement flows  
**Effort:** 45 minutes  
**Files:**
- `app/(landing-page)/contact/call/page.tsx`
- `app/(landing-page)/contact/resume/page.tsx`
- `app/(landing-page)/contact/message/page.tsx`

**Hardcoded Strings:**
```
Contact Call Page:
- "Back to Home" → contact.call.backToHome
- "Book a Quick Call" → contact.call.title
- "Get instant answers..." → contact.call.subtitle
- "Call Details", "Duration", "30 minutes" → contact.call.*
- "Availability", "Monday - Friday" → contact.call.availability*
- "Response Time" → contact.call.responseTime
- "What's Included" → contact.call.whatsIncluded
- All feature items → contact.call.features.*

Resume Page:
- "Please fill in all required fields" → forms.errors.allFieldsRequired
- "Request created! Please proceed with payment." → resume.success.requestCreated
- "Failed to submit request." → resume.errors.submitFailed
- "Something went wrong." → common.errors.generic
- "Professional Resume Creation Service" → contact.resume.title
- "Quick Turnaround", "German Standards", "Expert Review" → contact.resume.features.*
- "Personal Information" → forms.sections.personalInfo
- All form labels → forms.labels.*
- "John Doe", "john@example.com" placeholders → forms.placeholders.*

Message Page:
- Already has useTranslations - verify all keys exist
```

**Translation Keys to Add:**
```typescript
// In messages/[locale].json
"contact": {
  "call": {
    "backToHome": "Back to Home" | "العودة للرئيسية" | "Zurück zur Startseite",
    "title": "Book a Quick Call" | "احجز مكالمة سريعة" | "Schnellanruf buchen",
    "subtitle": "Get instant answers..." | "احصل على إجابات فورية..." | "Sofortige Antworten...",
    "details": "Call Details" | "تفاصيل المكالمة" | "Anrufdetails",
    "duration30min": "30 minutes" | "30 دقيقة" | "30 Minuten",
    "availabilityWeekdays": "Monday - Friday\n9:00 AM - 6:00 PM CET" | "..." | "...",
    "sameDayBooking": "Same day booking available" | "الحجز في نفس اليوم متاح" | "...",
    "whatsIncluded": "What's Included" | "ما المشمول" | "Was ist enthalten",
    "features": {
      "qanda": "Quick Q&A session" | "جلسة أسئلة وأجوبة سريعة" | "...",
      "advice": "Personalized advice" | "نصائح شخصية" | "...",
      // ... more features
    }
  },
  "resume": {
    "features": {
      "speed": "Quick Turnaround" | "إنجاز سريع" | "Schnelle Bearbeitung",
      "standards": "German Standards" | "المعايير الألمانية" | "Deutsche Standards",
      "expert": "Expert Review" | "مراجعة الخبراء" | "Expertenprüfung"
    }
  }
}
```

---

### ✅ Task 2: Course Purchase & Payment Flow
**Impact:** Revenue-critical conversion flow  
**Effort:** 40 minutes  
**Files:**
- `app/(landing-page)/course/[courseId]/_components/PurchaseCourseCard.tsx`
- `app/(landing-page)/course/[courseId]/_components/BankTransferUpload.tsx`

**Hardcoded Strings:**
```
PurchaseCourseCard:
- "Upload Successful" → payment.uploadSuccessful
- "Enrolled Successfully" → enrollment.success
- "Enrollment Failed" → enrollment.failed

BankTransferUpload:
- "Upload Successful" → payment.uploadSuccessful
- "Submission Failed" → payment.submissionFailed
- "File Uploaded" → file.uploaded
- "Upload Failed" → file.uploadFailed
- "Bank Transfer Instructions" → payment.bankTransfer.instructions
- "Upload Payment Proof" → payment.uploadProof
- "Transfer Reference (Optional)" → payment.transferReference
- "e.g., Transfer reference number..." → payment.referencePlaceholder
```

**Translation Keys to Add:**
```typescript
"enrollment": {
  "success": "Enrolled Successfully" | "تم التسجيل بنجاح" | "Erfolgreich eingeschrieben",
  "failed": "Enrollment Failed" | "فشل التسجيل" | "Einschreibung fehlgeschlagen"
},
"file": {
  "uploaded": "File Uploaded" | "تم رفع الملف" | "Datei hochgeladen",
  "uploadFailed": "Upload Failed" | "فشل الرفع" | "Upload fehlgeschlagen"
}
```

---

### ✅ Task 3: Documents Page Sorting & Filtering
**Impact:** User navigation experience  
**Effort:** 20 minutes  
**Files:**
- `app/(landing-page)/documents/page.tsx`

**Hardcoded Strings:**
```
- "Newest First" → sort.newest
- "Most Downloaded" → sort.mostDownloaded
- "Title A-Z" → sort.titleAZ
- "All Categories" → filters.allCategories
- "Failed to load documents" → errors.documentsLoadFailed
- "Download started!" → documents.downloadStarted
- "Failed to download file" → documents.downloadFailed
- "Essential Resources" → documents.essentialResources
- "Search documents, guides, templates..." → documents.searchPlaceholder
```

**Translation Keys to Add:**
```typescript
"sort": {
  "newest": "Newest First" | "الأحدث أولاً" | "Neueste zuerst",
  "mostDownloaded": "Most Downloaded" | "الأكثر تنزيلاً" | "Am meisten heruntergeladen",
  "titleAZ": "Title A-Z" | "العنوان أ-ي" | "Titel A-Z"
},
"documents": {
  "essentialResources": "Essential Resources" | "الموارد الأساسية" | "Wesentliche Ressourcen",
  "searchPlaceholder": "Search documents..." | "ابحث في المستندات..." | "Dokumente durchsuchen...",
  "downloadStarted": "Download started!" | "بدأ التنزيل!" | "Download gestartet!",
  "downloadFailed": "Failed to download file" | "فشل تنزيل الملف" | "Datei-Download fehlgeschlagen"
}
```

---

### ✅ Task 4: Courses Page & Filtering
**Impact:** Primary course discovery  
**Effort:** 30 minutes  
**Files:**
- `app/(landing-page)/courses/_components/CoursesContent.tsx`
- `app/(landing-page)/courses/[keywords]/page.tsx`

**Hardcoded Strings:**
```
CoursesContent:
- "Beginner", "Intermediate", "Advanced" → filters.level.* (already exists - verify)
- "Discover Your Path to Germany" → coursesPage.hero.title
- Stats labels → coursesPage.stats.*
- "Filters" → filters.filters
- "No courses found" → messages.noCourses (already exists)

Keywords Page:
- "Any price" → filters.price.any
- Price range options → filters.price.*
```

**Translation Keys to Add:**
```typescript
"coursesPage": {
  "hero": {
    "title": "Discover Your Path to Germany" | "اكتشف طريقك إلى ألمانيا" | "..."
  },
  "stats": {
    "coursesCount": "{count} Courses" | "{count} دورة" | "{count} Kurse",
    "studentsCount": "{count}+ Students" | "{count}+ طالب" | "...",
    "averageRating": "{rating} Average Rating" | "متوسط {rating}" | "..."
  }
},
"filters": {
  "price": {
    "any": "Any price" | "أي سعر" | "Beliebiger Preis",
    "under20": "Under €20" | "أقل من 20 يورو" | "Unter 20€",
    "under50": "Under €50" | "أقل من 50 يورو" | "Unter 50€"
  }
}
```

---

### ✅ Task 5: Success Stories Section (Data)
**Impact:** Social proof & credibility  
**Effort:** 30 minutes  
**Files:**
- `app/(landing-page)/_components/SuccessStoriesSection.tsx`

**Hardcoded Strings:**
```
Success stories data (names, pathways, achievements, quotes):
- "Sarah Ahmed" → Keep as-is (actual names)
- "Study Path" → pathways.studyPath
- "Work Path" → pathways.workPath
- Achievement texts → successStories.achievements.*
- Quote texts → successStories.quotes.*
```

**Approach:**
Either move to translation files OR fetch from database. For static demo data, add to translations:

```typescript
"successStories": {
  "stories": [
    {
      "name": "Sarah Ahmed",
      "pathway": "Study Path" | "مسار الدراسة" | "Studienpfad",
      "achievement": "Accepted to TU Munich..." | "..." | "...",
      "quote": "The visa process..." | "..." | "..."
    }
    // ... more stories
  ]
}
```

---

### ✅ Task 6: Admin Payment Proofs Review
**Impact:** Admin workflow efficiency  
**Effort:** 25 minutes  
**Files:**
- `app/(dashboard)/(routes)/admin/payment-proofs/page.tsx`

**Hardcoded Strings:**
```
- "Proof Approved" / "Proof Rejected" → admin.paymentProofs.proofApproved/Rejected
- "Payment Proofs Review" → admin.paymentProofs.title
- "Notes (Optional)" → forms.notesOptional
- "Add notes about this payment proof..." → admin.paymentProofs.notesPlaceholder
```

---

### ✅ Task 7: Admin Bookings Management
**Impact:** Admin core functionality  
**Effort:** 25 minutes  
**Files:**
- `app/(dashboard)/(routes)/admin/bookings/page.tsx`

**Hardcoded Strings:**
```
- "Meeting Bookings" → admin.bookings.title (verify exists)
- "Student Information" → admin.bookings.sections.studentInfo
- "Meeting Details" → admin.bookings.sections.meetingDetails
- "Payment Information" → admin.bookings.sections.paymentInfo
- "Payment Proof" → admin.bookings.paymentProof
- "Student Notes" → admin.bookings.studentNotes
- "Admin Notes (Optional)" → admin.bookings.adminNotesOptional
- "Add any notes about this booking..." → admin.bookings.notesPlaceholder
```

---

### ✅ Task 8: Admin Resume Management
**Impact:** Admin core functionality  
**Effort:** 30 minutes  
**Files:**
- `app/(dashboard)/(routes)/admin/resumes/page.tsx`
- `app/(dashboard)/(routes)/admin/resume-workflow/page.tsx`
- `app/(dashboard)/(routes)/admin/resume-payments/page.tsx`

**Hardcoded Strings:**
```
Resumes page:
- "Resume Requests Management" → admin.resumes.title
- "Contact Information", "Professional Details" → admin.resumes.sections.*
- "Current CV/Resume", "Payment Proof" → admin.resumes.*
- "Additional Information" → admin.resumes.additionalInfo
- "Upload Completed Resume" → admin.resumes.uploadCompleted
- "Completed Resume" → admin.resumes.completedResume
- "Admin Notes" → admin.adminNotes
- "Add notes about this request..." → admin.resumes.notesPlaceholder
```

---

### ✅ Task 9: Admin Statistics Dashboard
**Impact:** Admin analytics visibility  
**Effort:** 20 minutes  
**Files:**
- `app/(dashboard)/(routes)/admin/statistics/page.tsx`

**Hardcoded Strings:**
```
- "Total Users" → admin.statistics.totalUsers (verify)
- "Total Instructors" → admin.statistics.totalInstructors (verify)
- "Total Courses" → admin.statistics.totalCourses (verify)
- "Platform Monthly Revenue" → admin.statistics.monthlyRevenue
```

---

### ✅ Task 10: Teacher Documents Management
**Impact:** Teacher core functionality  
**Effort:** 25 minutes  
**Files:**
- `app/(dashboard)/(routes)/teacher/documents/page.tsx`

**Hardcoded Strings:**
```
- "Failed to load documents" → teacher.documents.loadFailed
- "Please upload a file first" → teacher.documents.uploadFirst
- "Document uploaded successfully!" → teacher.documents.uploadSuccess
- "Failed to update document" → teacher.documents.updateFailed
- "Document updated successfully!" → teacher.documents.updateSuccess
- "Document deleted successfully!" → teacher.documents.deleteSuccess
- "My Documents" → teacher.documents.title
- "Title *" → forms.titleRequired
- "e.g., Visa Application Checklist" → teacher.documents.titlePlaceholder
- "Brief description of the document..." → teacher.documents.descriptionPlaceholder
- "e.g., germany, visa, checklist" → teacher.documents.tagsPlaceholder
- "Search documents..." → teacher.documents.searchPlaceholder
```

---

### ✅ Task 11: Teacher Course Management
**Impact:** Teacher core functionality  
**Effort:** 35 minutes  
**Files:**
- `app/(dashboard)/(routes)/teacher/courses/manage/page.tsx`

**Hardcoded Strings:**
```
Course creation flow:
- "What type of course do you want to create?" → teacher.courses.create.selectType
- "Choose the format that best fits your content" → teacher.courses.create.selectFormat
- "Video Course" → teacher.courses.types.video
- "FAQ Course" → teacher.courses.types.faq
- "How about a working title?" → teacher.courses.create.titlePrompt
- "It's ok if you can't think of a good title now..." → teacher.courses.create.titleHelp
- "e.g. Learn Nextjs 14 from scratch" → teacher.courses.create.titlePlaceholder
- "What category best fits..." → teacher.courses.create.categoryPrompt
- "If you're not sure..." → teacher.courses.create.categoryHelp
- "Choose a category" → teacher.courses.create.categoryPlaceholder
```

---

### ✅ Task 12: Teacher Resume Requests
**Impact:** Teacher service delivery  
**Effort:** 20 minutes  
**Files:**
- `app/(dashboard)/(routes)/teacher/resume-requests/page.tsx`

**Hardcoded Strings:**
```
- "Failed to fetch resume requests" → teacher.resumes.fetchFailed
- "Status updated to In Progress" → teacher.resumes.statusUpdated
- "Failed to update status" → teacher.resumes.updateFailed
- "Please upload a resume file first" → teacher.resumes.uploadFirst
- "Resume delivered successfully!" → teacher.resumes.deliveredSuccess
- "Failed to submit resume" → teacher.resumes.submitFailed
- "Resume Requests" → teacher.resumes.title
```

---

## 🟡 MEDIUM PRIORITY (Enhanced User Experience)

### ✅ Task 13: Student Dashboard Pages
**Effort:** 30 minutes  
**Files:**
- `app/(dashboard)/(routes)/(student)/book-meeting/page.tsx`
- `app/(dashboard)/(routes)/(student)/my-learning/page.tsx`
- `app/(dashboard)/(routes)/(student)/my-proofs/page.tsx`
- `app/(dashboard)/(routes)/(student)/cart/page.tsx`
- `app/(dashboard)/(routes)/(student)/my-resume/page.tsx`

**Strings to Translate:**
```
Book Meeting:
- "Book a Meeting" → student.bookMeeting.title
- "Schedule a one-on-one consultation..." → student.bookMeeting.subtitle
- "What to Expect" → student.bookMeeting.whatToExpect
- Feature list items → student.bookMeeting.features.*
- "Ready to Book?" → student.bookMeeting.readyTitle
- "📝 Important Notes" → student.bookMeeting.importantNotes

My Learning:
- "My Learning" → student.myLearning.title
- "No courses yet" → student.myLearning.noCourses

My Proofs:
- "My Payment Proofs" → student.myProofs.title
- "No Payment Proofs" → student.myProofs.noProofs

Cart:
- "Your cart is empty" → cart.emptyCart (verify)
- "Shopping Cart" → cart.shoppingCart (verify)

My Resume:
- "My Resume" → student.myResume.title
- "Resume Details" → student.myResume.details
- Status messages → student.myResume.status.*
```

---

### ✅ Task 14: Student Profile Management
**Effort:** 25 minutes  
**Files:**
- `app/(dashboard)/(routes)/(student)/manage/_components/ProfileForm.tsx`

**Strings to Translate:**
```
All form placeholders:
- "First Name" → forms.placeholders.firstName
- "Last Name" → forms.placeholders.lastName
- "Username" → forms.placeholders.username
- "Email" → forms.placeholders.email
- "Website" → forms.placeholders.website
- "LinkedIn" → forms.placeholders.linkedin
- "YouTube" → forms.placeholders.youtube
- "GitHub" → forms.placeholders.github
- "Bio" → forms.placeholders.bio
```

---

### ✅ Task 15: Shared Components - BookingCalendar
**Effort:** 20 minutes  
**Files:**
- `components/shared/BookingCalendar.tsx`

**Strings to Translate:**
```
- "Select a Date" → components.bookingCalendar.selectDate
- "Available Time Slots" → components.bookingCalendar.availableSlots
- "Notes (Optional)" → components.bookingCalendar.notesOptional
- "Add any notes or topics you'd like to discuss..." → components.bookingCalendar.notesPlaceholder
```

---

### ✅ Task 16: Shared Components - MeetingPayment
**Effort:** 25 minutes  
**Files:**
- `components/shared/MeetingPayment.tsx`

**Strings to Translate:**
```
- "Payment Proof Submitted!" → components.meetingPayment.submitted
- "Bank Transfer Instructions" → components.meetingPayment.instructions
- "Upload Payment Proof" → components.meetingPayment.uploadProof
- "Transfer Reference (Optional)" → components.meetingPayment.referenceOptional
- "Add any notes about the transfer..." → components.meetingPayment.notesPlaceholder
```

---

### ✅ Task 17: Shared Components - Footer
**Effort:** 15 minutes  
**Files:**
- `components/shared/Footer.tsx`

**Strings to Translate:**
```
- "Germany Formation" → footer.companyName (or keep as brand name)
- "Email" → footer.emailLabel
- "john@rhcp.com" → footer.emailPlaceholder
- Newsletter section → footer.newsletter.*
```

---

### ✅ Task 18: Shared Components - StatusAlert
**Effort:** 15 minutes  
**Files:**
- `components/shared/StatusAlert.tsx`

**Strings to Translate:**
```
All status messages for courses:
- "Whether you're updating an existing course..." → components.statusAlert.draft
- "Your course has been submitted for review..." → components.statusAlert.underReview
- "Your course submission has been reviewed..." → components.statusAlert.rejected
- "Your course has been reviewed and approved..." → components.statusAlert.approved
```

---

### ✅ Task 19: Shared Components - Search
**Effort:** 15 minutes  
**Files:**
- `components/shared/search/Search.tsx`
- `components/shared/search/MobileSearch.tsx`

**Strings to Translate:**
```
- "Search for anything" → search.placeholder
- Mobile search placeholder → search.mobilePlaceholder
```

---

### ✅ Task 20: Shared Components - ReviewBanner
**Effort:** 15 minutes  
**Files:**
- `components/shared/ReviewBanner.tsx`

**Strings to Translate:**
```
- "More Info about the reason ..." → components.reviewBanner.reasonPlaceholder
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### ✅ Task 21: Admin Categories Management
**Effort:** 15 minutes  
**Files:**
- `app/(dashboard)/(routes)/admin/categories/page.tsx`

**Strings to Translate:**
```
- "e.g. Design ..." → admin.categories.namePlaceholder
- "Categories" → admin.categories.title (verify)
```

---

### ✅ Task 22: Shared Components - Comments & Feedback
**Effort:** 20 minutes  
**Files:**
- `components/shared/Comments.tsx`
- `components/shared/FeedbackForm.tsx`
- `components/shared/ReplyForm.tsx`

**Strings to Translate:**
```
- "e.g Hey I have an error in section N°..." → comments.examplePlaceholder
- "Search for anything" → search.placeholder
- "Please provide us with detailed feedback..." → feedback.placeholder
- "Enter your answer..." → reply.placeholder
```

---

### ✅ Task 23: User Statistics
**Effort:** 10 minutes  
**Files:**
- `app/(dashboard)/(routes)/user/[id]/page.tsx`

**Strings to Translate:**
```
- "Total students" → user.statistic.totalStudents (verify exists)
```

---

### ✅ Task 24: Meeting Room
**Effort:** 10 minutes  
**Files:**
- `app/meet/[room]/page.tsx`

**Strings to Translate:**
```
- "Invalid meeting room" → meet.error.invalidRoom (verify exists)
```

---

### ✅ Task 25: Certificate Page
**Effort:** 15 minutes  
**Files:**
- `app/(dashboard)/(routes)/(student)/certificate/[courseId]/_components/CertificateInitialScreen.tsx`

**Strings to Translate:**
```
- Certificate heading → certificate.heading
- Certificate subheading → certificate.subheading
- Certificate title → certificate.title
```

---

### ✅ Task 26: Technology Keywords List (SEO)
**Effort:** 30 minutes  
**Files:**
- `lib/data.ts`

**Strings to Translate:**
```
200+ technology keywords for filtering/SEO
- Can keep in English for SEO purposes OR
- Translate for better local search in Arabic/German markets
```

**Decision:** Recommend keeping in English for international tech terms, but add translations for common terms like:
- "Programming" → "البرمجة" / "Programmierung"
- "Design" → "التصميم" / "Design"
- "Development" → "التطوير" / "Entwicklung"

---

## 📋 Implementation Guidelines

### For Each Task:

1. **Add Translation Keys** to all three files:
   - `messages/ar.json`
   - `messages/en.json`
   - `messages/de.json`

2. **Update Component** to use `useTranslations()`:
   ```typescript
   import { useTranslations } from 'next-intl';
   
   // In component
   const t = useTranslations('namespace');
   
   // Replace hardcoded string
   - <h1>Hardcoded Text</h1>
   + <h1>{t('key')}</h1>
   ```

3. **Test** in all three languages:
   - Visit `/` (Arabic)
   - Visit `/en` (English)
   - Visit `/de` (German)

4. **Verify** RTL/LTR layout for Arabic

---

## 🎯 Suggested Work Plan

### Week 1: High Priority (Tasks 1-6)
- **Day 1:** Tasks 1-2 (Contact forms, Payment)
- **Day 2:** Tasks 3-4 (Documents, Courses)
- **Day 3:** Tasks 5-6 (Success Stories, Admin)

### Week 2: High Priority (Tasks 7-12)
- **Day 1:** Tasks 7-8 (Admin dashboards)
- **Day 2:** Tasks 9-10 (Statistics, Teacher docs)
- **Day 3:** Tasks 11-12 (Teacher courses, Resumes)

### Week 3: Medium Priority (Tasks 13-20)
- **Day 1:** Tasks 13-15 (Student pages)
- **Day 2:** Tasks 16-18 (Shared components)
- **Day 3:** Tasks 19-20 (Search, Reviews)

### Week 4: Low Priority (Tasks 21-26)
- Complete remaining tasks as needed

---

## 🔍 Testing Checklist

After completing each task:

- [ ] All three languages load without errors
- [ ] Arabic displays with proper RTL layout
- [ ] No hardcoded strings visible in UI
- [ ] Forms submit correctly with translated messages
- [ ] Toast notifications show in correct language
- [ ] Navigation works in all languages
- [ ] Mobile view displays correctly
- [ ] Admin dashboard functions properly

---

## 📝 Notes

- **Brand Names:** Keep "Nach Deutschland", "Germany Formation" as-is
- **Proper Names:** Keep person names, company names untranslated
- **Technical Terms:** Some tech keywords can stay in English
- **URLs:** Keep URL paths in English for SEO
- **Dates/Currency:** Use locale-specific formatting (already handled by next-intl)

---

## ✅ Completion Criteria

The project is **100% translated** when:

1. ✅ No visible hardcoded user-facing strings
2. ✅ All forms show translated labels and placeholders
3. ✅ All success/error messages are translated
4. ✅ All three languages fully functional
5. ✅ RTL layout works perfectly for Arabic
6. ✅ No console errors related to missing translation keys

---

**Happy Translating! 🌍**
