/**
 * Auto-Generate Missing Translations
 * Automatically translates missing keys using context-aware translation
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationMap {
  [key: string]: {
    en: string;
    de: string;
  };
}

// Manual translation mappings generated from Arabic source
const translations: TranslationMap = {
  // Admin Categories
  "dashboard.admin.categories.categoryDeleted": {
    en: "Category Deleted",
    de: "Kategorie gelöscht"
  },
  "dashboard.admin.categories.categoryDeletedDesc": {
    en: "Category has been deleted successfully",
    de: "Kategorie wurde erfolgreich gelöscht"
  },
  "dashboard.admin.categories.categoryPlaceholder": {
    en: "Category name...",
    de: "Kategoriename..."
  },
  "dashboard.admin.categories.categoryUpdated": {
    en: "Category Updated",
    de: "Kategorie aktualisiert"
  },
  "dashboard.admin.categories.categoryUpdatedDesc": {
    en: "Category has been updated successfully",
    de: "Kategorie wurde erfolgreich aktualisiert"
  },
  "dashboard.admin.categories.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.admin.categories.filterPlaceholder": {
    en: "Filter categories...",
    de: "Kategorien filtern..."
  },
  "dashboard.admin.categories.noChanges": {
    en: "No Changes",
    de: "Keine Änderungen"
  },
  "dashboard.admin.categories.noChangesDesc": {
    en: "No changes were made",
    de: "Keine Änderungen vorgenommen"
  },
  
  // Admin Payment Proofs
  "dashboard.admin.paymentProofs.adminNotes": {
    en: "Admin Notes",
    de: "Admin-Notizen"
  },
  "dashboard.admin.paymentProofs.adminNotesPlaceholder": {
    en: "Add notes (optional)...",
    de: "Notizen hinzufügen (optional)..."
  },
  "dashboard.admin.paymentProofs.adminNotesRequired": {
    en: "Please provide a reason for rejection",
    de: "Bitte geben Sie einen Grund für die Ablehnung an"
  },
  "dashboard.admin.paymentProofs.all": {
    en: "All",
    de: "Alle"
  },
  "dashboard.admin.paymentProofs.amount": {
    en: "Amount",
    de: "Betrag"
  },
  "dashboard.admin.paymentProofs.approve": {
    en: "Approve",
    de: "Genehmigen"
  },
  "dashboard.admin.paymentProofs.approveProof": {
    en: "Approve Payment Proof",
    de: "Zahlungsnachweis genehmigen"
  },
  "dashboard.admin.paymentProofs.approved": {
    en: "Approved",
    de: "Genehmigt"
  },
  "dashboard.admin.paymentProofs.approvedBadge": {
    en: "Approved",
    de: "Genehmigt"
  },
  "dashboard.admin.paymentProofs.approvedBy": {
    en: "Approved by",
    de: "Genehmigt von"
  },
  "dashboard.admin.paymentProofs.courses": {
    en: "Courses",
    de: "Kurse"
  },
  "dashboard.admin.paymentProofs.email": {
    en: "Email",
    de: "E-Mail"
  },
  "dashboard.admin.paymentProofs.errorApproving": {
    en: "Failed to approve payment proof",
    de: "Fehler beim Genehmigen des Zahlungsnachweises"
  },
  "dashboard.admin.paymentProofs.errorLoadingProofs": {
    en: "Failed to load payment proofs",
    de: "Fehler beim Laden der Zahlungsnachweise"
  },
  "dashboard.admin.paymentProofs.errorRejecting": {
    en: "Failed to reject payment proof",
    de: "Fehler beim Ablehnen des Zahlungsnachweises"
  },
  "dashboard.admin.paymentProofs.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.admin.paymentProofs.fileSize": {
    en: "File Size",
    de: "Dateigröße"
  },
  "dashboard.admin.paymentProofs.name": {
    en: "Name",
    de: "Name"
  },
  "dashboard.admin.paymentProofs.noProofsFound": {
    en: "No Payment Proofs",
    de: "Keine Zahlungsnachweise"
  },
  "dashboard.admin.paymentProofs.noProofsStatus": {
    en: "No {status} payment proofs found",
    de: "Keine {status} Zahlungsnachweise gefunden"
  },
  "dashboard.admin.paymentProofs.noProofsSubmitted": {
    en: "No payment proofs have been submitted yet",
    de: "Es wurden noch keine Zahlungsnachweise eingereicht"
  },
  "dashboard.admin.paymentProofs.on": {
    en: "on",
    de: "am"
  },
  "dashboard.admin.paymentProofs.paymentInfo": {
    en: "Payment Information",
    de: "Zahlungsinformationen"
  },
  "dashboard.admin.paymentProofs.pending": {
    en: "Pending",
    de: "Ausstehend"
  },
  "dashboard.admin.paymentProofs.pendingBadge": {
    en: "Pending",
    de: "Ausstehend"
  },
  "dashboard.admin.paymentProofs.proofApproved": {
    en: "Payment Proof Approved",
    de: "Zahlungsnachweis genehmigt"
  },
  "dashboard.admin.paymentProofs.proofApprovedDesc": {
    en: "The student has been notified and granted access",
    de: "Der Student wurde benachrichtigt und erhielt Zugriff"
  },
  "dashboard.admin.paymentProofs.proofDetails": {
    en: "Payment Proof Details",
    de: "Zahlungsnachweis-Details"
  },
  "dashboard.admin.paymentProofs.proofRejected": {
    en: "Payment Proof Rejected",
    de: "Zahlungsnachweis abgelehnt"
  },
  "dashboard.admin.paymentProofs.proofRejectedDesc": {
    en: "The student has been notified",
    de: "Der Student wurde benachrichtigt"
  },
  "dashboard.admin.paymentProofs.provideReason": {
    en: "Please provide a reason for rejection",
    de: "Bitte geben Sie einen Grund für die Ablehnung an"
  },
  "dashboard.admin.paymentProofs.reject": {
    en: "Reject",
    de: "Ablehnen"
  },
  "dashboard.admin.paymentProofs.rejectProof": {
    en: "Reject Payment Proof",
    de: "Zahlungsnachweis ablehnen"
  },
  "dashboard.admin.paymentProofs.rejected": {
    en: "Rejected",
    de: "Abgelehnt"
  },
  "dashboard.admin.paymentProofs.rejectedBadge": {
    en: "Rejected",
    de: "Abgelehnt"
  },
  "dashboard.admin.paymentProofs.rejectedBy": {
    en: "Rejected by",
    de: "Abgelehnt von"
  },
  "dashboard.admin.paymentProofs.studentInfo": {
    en: "Student Information",
    de: "Studenteninformationen"
  },
  "dashboard.admin.paymentProofs.studentNotes": {
    en: "Student Notes",
    de: "Studentennotizen"
  },
  "dashboard.admin.paymentProofs.subtitle": {
    en: "Review and manage payment proof submissions",
    de: "Zahlungsnachweise überprüfen und verwalten"
  },
  "dashboard.admin.paymentProofs.title": {
    en: "Payment Proofs",
    de: "Zahlungsnachweise"
  },
  "dashboard.admin.paymentProofs.uploadedAt": {
    en: "Uploaded at",
    de: "Hochgeladen am"
  },
  "dashboard.admin.paymentProofs.view": {
    en: "View",
    de: "Ansehen"
  },
  "dashboard.admin.paymentProofs.viewProof": {
    en: "View Payment Proof",
    de: "Zahlungsnachweis ansehen"
  },
  
  // Pending Courses
  "dashboard.admin.pendingCourses.searchPlaceholder": {
    en: "Search pending courses...",
    de: "Ausstehende Kurse durchsuchen..."
  },
  
  // Resume Workflow
  "dashboard.admin.resumeWorkflow.awaitingCreation": {
    en: "Awaiting Resume Creation",
    de: "Warten auf Lebenslauferstellung"
  },
  "dashboard.admin.resumeWorkflow.completedBadge": {
    en: "Completed",
    de: "Abgeschlossen"
  },
  "dashboard.admin.resumeWorkflow.completedResume": {
    en: "Completed Resume",
    de: "Fertiger Lebenslauf"
  },
  "dashboard.admin.resumeWorkflow.currentCV": {
    en: "Current CV",
    de: "Aktueller Lebenslauf"
  },
  "dashboard.admin.resumeWorkflow.currentRole": {
    en: "Current Role",
    de: "Aktuelle Position"
  },
  "dashboard.admin.resumeWorkflow.detailsTitle": {
    en: "Resume Request Details",
    de: "Details zur Lebenslaufanfrage"
  },
  "dashboard.admin.resumeWorkflow.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.admin.resumeWorkflow.experience": {
    en: "Experience",
    de: "Erfahrung"
  },
  "dashboard.admin.resumeWorkflow.notes": {
    en: "Notes",
    de: "Notizen"
  },
  "dashboard.admin.resumeWorkflow.notesPlaceholder": {
    en: "Add any notes...",
    de: "Notizen hinzufügen..."
  },
  "dashboard.admin.resumeWorkflow.resumeSubmittedDesc": {
    en: "Resume has been submitted to the student",
    de: "Lebenslauf wurde an den Studenten übermittelt"
  },
  "dashboard.admin.resumeWorkflow.resumeUploadedSuccess": {
    en: "Resume Uploaded Successfully",
    de: "Lebenslauf erfolgreich hochgeladen"
  },
  "dashboard.admin.resumeWorkflow.resumesDelivered": {
    en: "Resumes Delivered",
    de: "Lebensläufe zugestellt"
  },
  "dashboard.admin.resumeWorkflow.submitResume": {
    en: "Submit Resume",
    de: "Lebenslauf einreichen"
  },
  "dashboard.admin.resumeWorkflow.successTitle": {
    en: "Success",
    de: "Erfolg"
  },
  "dashboard.admin.resumeWorkflow.targetRole": {
    en: "Target Role",
    de: "Zielposition"
  },
  "dashboard.admin.resumeWorkflow.uploadResumeFirst": {
    en: "Please upload a resume file first",
    de: "Bitte laden Sie zuerst eine Lebenslaufdatei hoch"
  },
  
  // Admin Resumes
  "dashboard.admin.resumes.additionalInfo": {
    en: "Additional Information",
    de: "Zusätzliche Informationen"
  },
  "dashboard.admin.resumes.adminNotes": {
    en: "Admin Notes",
    de: "Admin-Notizen"
  },
  "dashboard.admin.resumes.adminNotesPlaceholder": {
    en: "Add any notes...",
    de: "Notizen hinzufügen..."
  },
  "dashboard.admin.resumes.approvePayment": {
    en: "Approve Payment",
    de: "Zahlung genehmigen"
  },
  "dashboard.admin.resumes.completed": {
    en: "Completed",
    de: "Abgeschlossen"
  },
  "dashboard.admin.resumes.completedResume": {
    en: "Completed Resume",
    de: "Fertiger Lebenslauf"
  },
  "dashboard.admin.resumes.contactInfo": {
    en: "Contact Information",
    de: "Kontaktinformationen"
  },
  "dashboard.admin.resumes.currentCV": {
    en: "Current CV",
    de: "Aktueller Lebenslauf"
  },
  "dashboard.admin.resumes.currentRole": {
    en: "Current Role",
    de: "Aktuelle Position"
  },
  "dashboard.admin.resumes.detailsTitle": {
    en: "Resume Request Details",
    de: "Details zur Lebenslaufanfrage"
  },
  "dashboard.admin.resumes.education": {
    en: "Education",
    de: "Bildung"
  },
  "dashboard.admin.resumes.email": {
    en: "Email",
    de: "E-Mail"
  },
  "dashboard.admin.resumes.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.admin.resumes.experience": {
    en: "Experience",
    de: "Erfahrung"
  },
  "dashboard.admin.resumes.name": {
    en: "Name",
    de: "Name"
  },
  "dashboard.admin.resumes.paymentApprovedDesc": {
    en: "Payment has been approved successfully",
    de: "Zahlung wurde erfolgreich genehmigt"
  },
  "dashboard.admin.resumes.paymentProof": {
    en: "Payment Proof",
    de: "Zahlungsnachweis"
  },
  "dashboard.admin.resumes.paymentRejectedDesc": {
    en: "Payment has been rejected",
    de: "Zahlung wurde abgelehnt"
  },
  "dashboard.admin.resumes.pendingReview": {
    en: "Pending Review",
    de: "Überprüfung ausstehend"
  },
  "dashboard.admin.resumes.phone": {
    en: "Phone",
    de: "Telefon"
  },
  "dashboard.admin.resumes.price": {
    en: "Price",
    de: "Preis"
  },
  "dashboard.admin.resumes.professionalDetails": {
    en: "Professional Details",
    de: "Berufliche Details"
  },
  "dashboard.admin.resumes.rejectPayment": {
    en: "Reject Payment",
    de: "Zahlung ablehnen"
  },
  "dashboard.admin.resumes.resumeSubmittedDesc": {
    en: "Resume has been submitted to the student",
    de: "Lebenslauf wurde an den Studenten übermittelt"
  },
  "dashboard.admin.resumes.resumeUploadedSuccess": {
    en: "Resume uploaded successfully",
    de: "Lebenslauf erfolgreich hochgeladen"
  },
  "dashboard.admin.resumes.skills": {
    en: "Skills",
    de: "Fähigkeiten"
  },
  "dashboard.admin.resumes.submitResume": {
    en: "Submit Resume",
    de: "Lebenslauf einreichen"
  },
  "dashboard.admin.resumes.subtitle": {
    en: "Manage resume requests and payments",
    de: "Lebenslaufanfragen und Zahlungen verwalten"
  },
  "dashboard.admin.resumes.successTitle": {
    en: "Success",
    de: "Erfolg"
  },
  "dashboard.admin.resumes.targetRole": {
    en: "Target Role",
    de: "Zielposition"
  },
  "dashboard.admin.resumes.title": {
    en: "Resume Requests",
    de: "Lebenslaufanfragen"
  },
  "dashboard.admin.resumes.uploadResume": {
    en: "Upload Resume",
    de: "Lebenslauf hochladen"
  },
  "dashboard.admin.resumes.view": {
    en: "View",
    de: "Ansehen"
  },
  "dashboard.admin.resumes.viewDetails": {
    en: "View Details",
    de: "Details anzeigen"
  },
  "dashboard.admin.resumes.viewFullSize": {
    en: "View full size",
    de: "Vollständig anzeigen"
  },
  
  // Student sections - Meeting
  "dashboard.student.meeting.book": {
    en: "Book",
    de: "Buchen"
  },
  "dashboard.student.meeting.bookConsultation": {
    en: "Book Consultation",
    de: "Beratung buchen"
  },
  "dashboard.student.meeting.bookingAwaitingPayment": {
    en: "Booking Awaiting Payment Approval",
    de: "Buchung wartet auf Zahlungsbestätigung"
  },
  "dashboard.student.meeting.bookingCancelled": {
    en: "Booking Cancelled",
    de: "Buchung storniert"
  },
  "dashboard.student.meeting.bookingCancelledDesc": {
    en: "Your booking has been cancelled",
    de: "Ihre Buchung wurde storniert"
  },
  "dashboard.student.meeting.bookingCompleted": {
    en: "Meeting Completed",
    de: "Meeting abgeschlossen"
  },
  "dashboard.student.meeting.bookingDetails": {
    en: "Booking Details",
    de: "Buchungsdetails"
  },
  "dashboard.student.meeting.bookingSuccess": {
    en: "Booking Successful",
    de: "Buchung erfolgreich"
  },
  "dashboard.student.meeting.bookingSuccessDesc": {
    en: "Your consultation has been booked successfully",
    de: "Ihre Beratung wurde erfolgreich gebucht"
  },
  "dashboard.student.meeting.cancel": {
    en: "Cancel",
    de: "Abbrechen"
  },
  "dashboard.student.meeting.cancelBooking": {
    en: "Cancel Booking",
    de: "Buchung stornieren"
  },
  "dashboard.student.meeting.confirmationMessage": {
    en: "We will review your payment proof and send you the meeting link via email once approved.",
    de: "Wir werden Ihren Zahlungsnachweis prüfen und Ihnen den Meeting-Link per E-Mail zusenden, sobald er genehmigt wurde."
  },
  "dashboard.student.meeting.consultationWith": {
    en: "Consultation with {name}",
    de: "Beratung mit {name}"
  },
  "dashboard.student.meeting.continue": {
    en: "Continue",
    de: "Fortfahren"
  },
  "dashboard.student.meeting.date": {
    en: "Date",
    de: "Datum"
  },
  "dashboard.student.meeting.duration": {
    en: "Duration",
    de: "Dauer"
  },
  "dashboard.student.meeting.errorBooking": {
    en: "Failed to create booking",
    de: "Fehler beim Erstellen der Buchung"
  },
  "dashboard.student.meeting.errorCancelling": {
    en: "Failed to cancel booking",
    de: "Fehler beim Stornieren der Buchung"
  },
  "dashboard.student.meeting.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.student.meeting.free": {
    en: "Free",
    de: "Kostenlos"
  },
  "dashboard.student.meeting.joinMeeting": {
    en: "Join Meeting",
    de: "Meeting beitreten"
  },
  "dashboard.student.meeting.meetingLink": {
    en: "Meeting Link",
    de: "Meeting-Link"
  },
  "dashboard.student.meeting.myBookings": {
    en: "My Bookings",
    de: "Meine Buchungen"
  },
  "dashboard.student.meeting.noAvailability": {
    en: "No availability found",
    de: "Keine Verfügbarkeit gefunden"
  },
  "dashboard.student.meeting.noBookingsDesc": {
    en: "You haven't booked any consultations yet",
    de: "Sie haben noch keine Beratungen gebucht"
  },
  "dashboard.student.meeting.noBookingsFound": {
    en: "No Bookings",
    de: "Keine Buchungen"
  },
  "dashboard.student.meeting.notes": {
    en: "Notes",
    de: "Notizen"
  },
  "dashboard.student.meeting.notesOptional": {
    en: "Notes (Optional)",
    de: "Notizen (Optional)"
  },
  "dashboard.student.meeting.notesPlaceholder": {
    en: "Add any specific topics or questions you'd like to discuss...",
    de: "Fügen Sie spezifische Themen oder Fragen hinzu, die Sie besprechen möchten..."
  },
  "dashboard.student.meeting.paymentAwaitingApproval": {
    en: "Payment Awaiting Approval",
    de: "Zahlung wartet auf Genehmigung"
  },
  "dashboard.student.meeting.paymentInfo": {
    en: "Payment Information",
    de: "Zahlungsinformationen"
  },
  "dashboard.student.meeting.paymentMethod": {
    en: "Payment Method",
    de: "Zahlungsmethode"
  },
  "dashboard.student.meeting.paymentProof": {
    en: "Payment Proof",
    de: "Zahlungsnachweis"
  },
  "dashboard.student.meeting.paymentProofRequired": {
    en: "Please upload a payment proof",
    de: "Bitte laden Sie einen Zahlungsnachweis hoch"
  },
  "dashboard.student.meeting.paymentRejected": {
    en: "Payment Rejected",
    de: "Zahlung abgelehnt"
  },
  "dashboard.student.meeting.price": {
    en: "Price",
    de: "Preis"
  },
  "dashboard.student.meeting.rejectionReason": {
    en: "Rejection Reason",
    de: "Ablehnungsgrund"
  },
  "dashboard.student.meeting.selectDateTime": {
    en: "Select Date & Time",
    de: "Datum & Uhrzeit wählen"
  },
  "dashboard.student.meeting.selectTimeSlot": {
    en: "Select a time slot",
    de: "Zeitfenster wählen"
  },
  "dashboard.student.meeting.status": {
    en: "Status",
    de: "Status"
  },
  "dashboard.student.meeting.subtitle": {
    en: "Schedule and manage your consultation sessions",
    de: "Planen und verwalten Sie Ihre Beratungstermine"
  },
  "dashboard.student.meeting.time": {
    en: "Time",
    de: "Uhrzeit"
  },
  "dashboard.student.meeting.timezone": {
    en: "Timezone",
    de: "Zeitzone"
  },
  "dashboard.student.meeting.title": {
    en: "Book a Consultation",
    de: "Beratung buchen"
  },
  "dashboard.student.meeting.uploadPaymentProof": {
    en: "Upload Payment Proof",
    de: "Zahlungsnachweis hochladen"
  },
  "dashboard.student.meeting.view": {
    en: "View",
    de: "Ansehen"
  },
  "dashboard.student.meeting.viewDetails": {
    en: "View Details",
    de: "Details anzeigen"
  },
  
  // Student Resume
  "dashboard.student.resume.additionalNotes": {
    en: "Additional Notes",
    de: "Zusätzliche Notizen"
  },
  "dashboard.student.resume.additionalNotesPlaceholder": {
    en: "Any additional information...",
    de: "Zusätzliche Informationen..."
  },
  "dashboard.student.resume.completed": {
    en: "Completed",
    de: "Abgeschlossen"
  },
  "dashboard.student.resume.confirmPayment": {
    en: "Confirm Payment",
    de: "Zahlung bestätigen"
  },
  "dashboard.student.resume.currentCV": {
    en: "Current CV",
    de: "Aktueller Lebenslauf"
  },
  "dashboard.student.resume.currentCVOptional": {
    en: "Current CV (Optional)",
    de: "Aktueller Lebenslauf (Optional)"
  },
  "dashboard.student.resume.currentRole": {
    en: "Current Role",
    de: "Aktuelle Position"
  },
  "dashboard.student.resume.download": {
    en: "Download",
    de: "Herunterladen"
  },
  "dashboard.student.resume.downloadResume": {
    en: "Download Resume",
    de: "Lebenslauf herunterladen"
  },
  "dashboard.student.resume.education": {
    en: "Education",
    de: "Bildung"
  },
  "dashboard.student.resume.errorTitle": {
    en: "Error",
    de: "Fehler"
  },
  "dashboard.student.resume.experience": {
    en: "Experience (years)",
    de: "Erfahrung (Jahre)"
  },
  "dashboard.student.resume.myRequests": {
    en: "My Resume Requests",
    de: "Meine Lebenslaufanfragen"
  },
  "dashboard.student.resume.noRequestsDesc": {
    en: "You haven't requested any resume services yet",
    de: "Sie haben noch keine Lebenslauf-Services angefragt"
  },
  "dashboard.student.resume.noRequestsFound": {
    en: "No Requests",
    de: "Keine Anfragen"
  },
  "dashboard.student.resume.paymentProof": {
    en: "Payment Proof",
    de: "Zahlungsnachweis"
  },
  "dashboard.student.resume.paymentProofRequired": {
    en: "Please upload a payment proof",
    de: "Bitte laden Sie einen Zahlungsnachweis hoch"
  },
  "dashboard.student.resume.pendingPayment": {
    en: "Pending Payment",
    de: "Ausstehende Zahlung"
  },
  "dashboard.student.resume.price": {
    en: "Price: {price} TND",
    de: "Preis: {price} TND"
  },
  "dashboard.student.resume.requestCreatedDesc": {
    en: "Your resume request has been submitted",
    de: "Ihre Lebenslaufanfrage wurde übermittelt"
  },
  "dashboard.student.resume.requestFailed": {
    en: "Failed to submit request",
    de: "Fehler beim Senden der Anfrage"
  },
  "dashboard.student.resume.requestSuccess": {
    en: "Request Submitted",
    de: "Anfrage übermittelt"
  },
  "dashboard.student.resume.skills": {
    en: "Skills",
    de: "Fähigkeiten"
  },
  "dashboard.student.resume.skillsPlaceholder": {
    en: "e.g., JavaScript, React, Node.js",
    de: "z.B. JavaScript, React, Node.js"
  },
  "dashboard.student.resume.status": {
    en: "Status",
    de: "Status"
  },
  "dashboard.student.resume.submitRequest": {
    en: "Submit Request",
    de: "Anfrage senden"
  },
  "dashboard.student.resume.subtitle": {
    en: "Get a professionally crafted resume tailored to your target role",
    de: "Erhalten Sie einen professionell gestalteten Lebenslauf für Ihre Zielposition"
  },
  "dashboard.student.resume.targetRole": {
    en: "Target Role",
    de: "Zielposition"
  },
  "dashboard.student.resume.title": {
    en: "Resume Service",
    de: "Lebenslauf-Service"
  },
  "dashboard.student.resume.uploadCV": {
    en: "Upload CV",
    de: "Lebenslauf hochladen"
  },
  "dashboard.student.resume.uploadPaymentProof": {
    en: "Upload Payment Proof",
    de: "Zahlungsnachweis hochladen"
  },
  "dashboard.student.resume.view": {
    en: "View",
    de: "Ansehen"
  },
  "dashboard.student.resume.viewDetails": {
    en: "View Details",
    de: "Details anzeigen"
  },
  "dashboard.student.resume.yourInformation": {
    en: "Your Information",
    de: "Ihre Informationen"
  },
  
  // Landing page additional
  "landingPage.footer.followUs": {
    en: "Follow Us",
    de: "Folgen Sie uns"
  },
  "landingPage.footer.privacyPolicy": {
    en: "Privacy Policy",
    de: "Datenschutzrichtlinie"
  },
  "landingPage.footer.rightsReserved": {
    en: "All rights reserved",
    de: "Alle Rechte vorbehalten"
  },
  "landingPage.footer.termsOfService": {
    en: "Terms of Service",
    de: "Nutzungsbedingungen"
  }
};

function generateMissingTranslations() {
  console.log('🔧 Generating missing translations...\n');
  
  // Load existing translation files
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  const dePath = path.join(MESSAGES_DIR, 'de.json');
  
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const deContent = JSON.parse(fs.readFileSync(dePath, 'utf-8'));
  
  let enAdded = 0;
  let deAdded = 0;
  
  // Add missing translations
  for (const [key, values] of Object.entries(translations)) {
    const keys = key.split('.');
    
    // Add to EN
    let enCurrent: any = enContent;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!enCurrent[keys[i]]) {
        enCurrent[keys[i]] = {};
      }
      enCurrent = enCurrent[keys[i]];
    }
    if (!enCurrent[keys[keys.length - 1]]) {
      enCurrent[keys[keys.length - 1]] = values.en;
      enAdded++;
    }
    
    // Add to DE
    let deCurrent: any = deContent;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!deCurrent[keys[i]]) {
        deCurrent[keys[i]] = {};
      }
      deCurrent = deCurrent[keys[i]];
    }
    if (!deCurrent[keys[keys.length - 1]]) {
      deCurrent[keys[keys.length - 1]] = values.de;
      deAdded++;
    }
  }
  
  // Write back to files
  fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n');
  fs.writeFileSync(dePath, JSON.stringify(deContent, null, 2) + '\n');
  
  console.log(`✅ Added ${enAdded} translations to EN`);
  console.log(`✅ Added ${deAdded} translations to DE\n`);
  
  return { enAdded, deAdded };
}

if (require.main === module) {
  generateMissingTranslations();
}

export { generateMissingTranslations, translations };
