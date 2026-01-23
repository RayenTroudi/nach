/**
 * Complete Translation Generation Script
 * Generates all 211 missing translations for EN and DE from Arabic reference
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

// Complete translation mappings for all 211 missing keys
const completeTranslations: TranslationMap = {
  // Admin Categories
  "dashboard.admin.categories.categoryDeleted": { en: "Category Deleted", de: "Kategorie gelöscht" },
  "dashboard.admin.categories.categoryDeletedDesc": { en: "Category has been deleted successfully", de: "Kategorie wurde erfolgreich gelöscht" },
  "dashboard.admin.categories.categoryPlaceholder": { en: "e.g., Design...", de: "z.B. Design..." },
  "dashboard.admin.categories.categoryUpdated": { en: "Congratulations!", de: "Glückwunsch!" },
  "dashboard.admin.categories.categoryUpdatedDesc": { en: "Category name has been updated successfully", de: "Kategoriename wurde erfolgreich aktualisiert" },
  "dashboard.admin.categories.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.admin.categories.filterPlaceholder": { en: "Filter categories...", de: "Kategorien filtern..." },
  "dashboard.admin.categories.noChanges": { en: "Information", de: "Information" },
  "dashboard.admin.categories.noChangesDesc": { en: "No changes were made", de: "Keine Änderungen vorgenommen" },
  
  // Admin Payment Proofs
  "dashboard.admin.paymentProofs.adminNotes": { en: "Admin Notes", de: "Admin-Notizen" },
  "dashboard.admin.paymentProofs.adminNotesPlaceholder": { en: "Add notes about this payment proof...", de: "Notizen zu diesem Zahlungsnachweis hinzufügen..." },
  "dashboard.admin.paymentProofs.adminNotesRequired": { en: "Admin notes are required", de: "Admin-Notizen sind erforderlich" },
  "dashboard.admin.paymentProofs.all": { en: "All", de: "Alle" },
  "dashboard.admin.paymentProofs.amount": { en: "Amount", de: "Betrag" },
  "dashboard.admin.paymentProofs.approve": { en: "Approve", de: "Genehmigen" },
  "dashboard.admin.paymentProofs.approveProof": { en: "Approve Proof", de: "Nachweis genehmigen" },
  "dashboard.admin.paymentProofs.approved": { en: "Approved", de: "Genehmigt" },
  "dashboard.admin.paymentProofs.approvedBadge": { en: "Approved", de: "Genehmigt" },
  "dashboard.admin.paymentProofs.approvedBy": { en: "Approved by", de: "Genehmigt von" },
  "dashboard.admin.paymentProofs.courses": { en: "Courses", de: "Kurse" },
  "dashboard.admin.paymentProofs.email": { en: "Email", de: "E-Mail" },
  "dashboard.admin.paymentProofs.errorApproving": { en: "Failed to approve proof", de: "Fehler beim Genehmigen des Nachweises" },
  "dashboard.admin.paymentProofs.errorLoadingProofs": { en: "Failed to load payment proofs", de: "Fehler beim Laden der Zahlungsnachweise" },
  "dashboard.admin.paymentProofs.errorRejecting": { en: "Failed to reject proof", de: "Fehler beim Ablehnen des Nachweises" },
  "dashboard.admin.paymentProofs.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.admin.paymentProofs.fileSize": { en: "File Size", de: "Dateigröße" },
  "dashboard.admin.paymentProofs.name": { en: "Name", de: "Name" },
  "dashboard.admin.paymentProofs.noProofsFound": { en: "No payment proofs found", de: "Keine Zahlungsnachweise gefunden" },
  "dashboard.admin.paymentProofs.noProofsStatus": { en: "No {status} payment proofs at the moment", de: "Derzeit keine {status} Zahlungsnachweise" },
  "dashboard.admin.paymentProofs.noProofsSubmitted": { en: "No payment proofs have been submitted yet", de: "Es wurden noch keine Zahlungsnachweise eingereicht" },
  "dashboard.admin.paymentProofs.on": { en: "on", de: "am" },
  "dashboard.admin.paymentProofs.paymentInfo": { en: "Payment Information", de: "Zahlungsinformationen" },
  "dashboard.admin.paymentProofs.pending": { en: "Pending", de: "Ausstehend" },
  "dashboard.admin.paymentProofs.pendingBadge": { en: "Pending", de: "Ausstehend" },
  "dashboard.admin.paymentProofs.proofApproved": { en: "Proof Approved", de: "Nachweis genehmigt" },
  "dashboard.admin.paymentProofs.proofApprovedDesc": { en: "Payment proof has been approved", de: "Zahlungsnachweis wurde genehmigt" },
  "dashboard.admin.paymentProofs.proofDetails": { en: "Payment Proof Details", de: "Zahlungsnachweis-Details" },
  "dashboard.admin.paymentProofs.proofRejected": { en: "Proof Rejected", de: "Nachweis abgelehnt" },
  "dashboard.admin.paymentProofs.proofRejectedDesc": { en: "Payment proof has been rejected", de: "Zahlungsnachweis wurde abgelehnt" },
  "dashboard.admin.paymentProofs.provideReason": { en: "Please provide a reason for rejection", de: "Bitte geben Sie einen Grund für die Ablehnung an" },
  "dashboard.admin.paymentProofs.reject": { en: "Reject", de: "Ablehnen" },
  "dashboard.admin.paymentProofs.rejectProof": { en: "Reject Proof", de: "Nachweis ablehnen" },
  "dashboard.admin.paymentProofs.rejected": { en: "Rejected", de: "Abgelehnt" },
  "dashboard.admin.paymentProofs.rejectedBadge": { en: "Rejected", de: "Abgelehnt" },
  "dashboard.admin.paymentProofs.rejectedBy": { en: "Rejected by", de: "Abgelehnt von" },
  "dashboard.admin.paymentProofs.studentInfo": { en: "Student Information", de: "Studenteninformationen" },
  "dashboard.admin.paymentProofs.studentNotes": { en: "Student Notes:", de: "Studentennotizen:" },
  "dashboard.admin.paymentProofs.subtitle": { en: "Review and approve/reject student payment proofs", de: "Zahlungsnachweise von Studenten überprüfen und genehmigen/ablehnen" },
  "dashboard.admin.paymentProofs.title": { en: "Review Payment Proofs", de: "Zahlungsnachweise überprüfen" },
  "dashboard.admin.paymentProofs.uploadedAt": { en: "Uploaded at", de: "Hochgeladen am" },
  "dashboard.admin.paymentProofs.view": { en: "View", de: "Ansehen" },
  "dashboard.admin.paymentProofs.viewProof": { en: "View Payment Proof", de: "Zahlungsnachweis ansehen" },
  
  // Admin Pending Courses
  "dashboard.admin.pendingCourses.searchPlaceholder": { en: "Search courses by instructor...", de: "Kurse nach Dozent durchsuchen..." },
  
  // Admin Resume Workflow
  "dashboard.admin.resumeWorkflow.awaitingCreation": { en: "Awaiting Resume Creation", de: "Warten auf Lebenslauferstellung" },
  "dashboard.admin.resumeWorkflow.completedBadge": { en: "Completed", de: "Abgeschlossen" },
  "dashboard.admin.resumeWorkflow.completedResume": { en: "Completed Resume", de: "Fertiger Lebenslauf" },
  "dashboard.admin.resumeWorkflow.currentCV": { en: "Current CV", de: "Aktueller Lebenslauf" },
  "dashboard.admin.resumeWorkflow.currentRole": { en: "Current Role", de: "Aktuelle Position" },
  "dashboard.admin.resumeWorkflow.detailsTitle": { en: "Resume Request Details", de: "Details zur Lebenslaufanfrage" },
  "dashboard.admin.resumeWorkflow.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.admin.resumeWorkflow.experience": { en: "Experience", de: "Erfahrung" },
  "dashboard.admin.resumeWorkflow.notes": { en: "Notes (Optional)", de: "Notizen (Optional)" },
  "dashboard.admin.resumeWorkflow.notesPlaceholder": { en: "Add notes about creating this resume...", de: "Notizen zur Erstellung dieses Lebenslaufs hinzufügen..." },
  "dashboard.admin.resumeWorkflow.resumeSubmittedDesc": { en: "Resume has been submitted successfully! Student has been notified.", de: "Lebenslauf wurde erfolgreich übermittelt! Student wurde benachrichtigt." },
  "dashboard.admin.resumeWorkflow.resumeUploadedSuccess": { en: "Resume uploaded successfully", de: "Lebenslauf erfolgreich hochgeladen" },
  "dashboard.admin.resumeWorkflow.resumesDelivered": { en: "Resumes Delivered", de: "Lebensläufe zugestellt" },
  "dashboard.admin.resumeWorkflow.submitResume": { en: "Submit Resume", de: "Lebenslauf einreichen" },
  "dashboard.admin.resumeWorkflow.successTitle": { en: "Success", de: "Erfolg" },
  "dashboard.admin.resumeWorkflow.targetRole": { en: "Target Role", de: "Zielposition" },
  "dashboard.admin.resumeWorkflow.uploadResumeFirst": { en: "Please upload the completed resume first", de: "Bitte laden Sie zuerst den fertigen Lebenslauf hoch" },
  
  // Admin Resumes
  "dashboard.admin.resumes.additionalInfo": { en: "Additional Information", de: "Zusätzliche Informationen" },
  "dashboard.admin.resumes.adminNotes": { en: "Admin Notes", de: "Admin-Notizen" },
  "dashboard.admin.resumes.adminNotesPlaceholder": { en: "Add notes about this request...", de: "Notizen zu dieser Anfrage hinzufügen..." },
  "dashboard.admin.resumes.approvePayment": { en: "Approve Payment", de: "Zahlung genehmigen" },
  "dashboard.admin.resumes.completed": { en: "Completed", de: "Abgeschlossen" },
  "dashboard.admin.resumes.completedResume": { en: "Completed Resume", de: "Fertiger Lebenslauf" },
  "dashboard.admin.resumes.contactInfo": { en: "Contact Information", de: "Kontaktinformationen" },
  "dashboard.admin.resumes.currentCV": { en: "Current CV", de: "Aktueller Lebenslauf" },
  "dashboard.admin.resumes.currentRole": { en: "Current Role", de: "Aktuelle Position" },
  "dashboard.admin.resumes.detailsTitle": { en: "Resume Request Details", de: "Details zur Lebenslaufanfrage" },
  "dashboard.admin.resumes.education": { en: "Education", de: "Bildung" },
  "dashboard.admin.resumes.email": { en: "Email", de: "E-Mail" },
  "dashboard.admin.resumes.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.admin.resumes.experience": { en: "Experience", de: "Erfahrung" },
  "dashboard.admin.resumes.name": { en: "Name", de: "Name" },
  "dashboard.admin.resumes.paymentApprovedDesc": { en: "Payment approved! The resume request is now being processed.", de: "Zahlung genehmigt! Die Lebenslaufanfrage wird nun bearbeitet." },
  "dashboard.admin.resumes.paymentProof": { en: "Payment Proof", de: "Zahlungsnachweis" },
  "dashboard.admin.resumes.paymentRejectedDesc": { en: "Payment has been rejected. Student will be notified.", de: "Zahlung wurde abgelehnt. Student wird benachrichtigt." },
  "dashboard.admin.resumes.pendingReview": { en: "Pending Review", de: "Überprüfung ausstehend" },
  "dashboard.admin.resumes.phone": { en: "Phone", de: "Telefon" },
  "dashboard.admin.resumes.price": { en: "Price", de: "Preis" },
  "dashboard.admin.resumes.professionalDetails": { en: "Professional Details", de: "Berufliche Details" },
  "dashboard.admin.resumes.rejectPayment": { en: "Reject Payment", de: "Zahlung ablehnen" },
  "dashboard.admin.resumes.resumeSubmittedDesc": { en: "Resume has been submitted successfully! Student has been notified.", de: "Lebenslauf wurde erfolgreich übermittelt! Student wurde benachrichtigt." },
  "dashboard.admin.resumes.resumeUploadedSuccess": { en: "Resume uploaded successfully", de: "Lebenslauf erfolgreich hochgeladen" },
  "dashboard.admin.resumes.skills": { en: "Skills", de: "Fähigkeiten" },
  "dashboard.admin.resumes.submitResume": { en: "Submit Resume", de: "Lebenslauf einreichen" },
  "dashboard.admin.resumes.subtitle": { en: "Manage client resume creation requests", de: "Lebenslauferstellungsanfragen von Kunden verwalten" },
  "dashboard.admin.resumes.successTitle": { en: "Success", de: "Erfolg" },
  "dashboard.admin.resumes.targetRole": { en: "Target Role", de: "Zielposition" },
  "dashboard.admin.resumes.title": { en: "Resume Requests", de: "Lebenslaufanfragen" },
  "dashboard.admin.resumes.totalRequests": { en: "Total Requests", de: "Gesamtanfragen" },
  "dashboard.admin.resumes.uploadCompletedResume": { en: "Upload Completed Resume", de: "Fertigen Lebenslauf hochladen" },
  "dashboard.admin.resumes.uploadResumeFirst": { en: "Please upload the completed resume first", de: "Bitte laden Sie zuerst den fertigen Lebenslauf hoch" },
  "dashboard.admin.resumes.view": { en: "View", de: "Ansehen" },
  "dashboard.admin.resumes.viewDetails": { en: "View Details", de: "Details anzeigen" },
  "dashboard.admin.resumes.viewFullSize": { en: "View full size", de: "Vollständig anzeigen" },
  
  // Student Cart
  "dashboard.student.cart.checkoutWithFlouci": { en: "Checkout with Flouci", de: "Mit Flouci bezahlen" },
  "dashboard.student.cart.course": { en: "course", de: "Kurs" },
  "dashboard.student.cart.courses": { en: "courses", de: "Kurse" },
  "dashboard.student.cart.coursesInCart": { en: "course in cart", de: "Kurs im Warenkorb" },
  "dashboard.student.cart.noCoursesInCart": { en: "No courses in cart.", de: "Keine Kurse im Warenkorb." },
  "dashboard.student.cart.startBrowsing": { en: "Start Browsing", de: "Mit dem Durchsuchen beginnen" },
  "dashboard.student.cart.title": { en: "Shopping Cart", de: "Warenkorb" },
  
  // Student Chat Rooms
  "dashboard.student.chatRooms.enrollInCourse": { en: "Once you enroll in a regular course, you will be automatically added to that course's learning room", de: "Sobald Sie sich in einen regulären Kurs einschreiben, werden Sie automatisch zum Lernraum dieses Kurses hinzugefügt" },
  "dashboard.student.chatRooms.noChatRooms": { en: "No chat rooms available", de: "Keine Chaträume verfügbar" },
  "dashboard.student.chatRooms.title": { en: "Learning Rooms", de: "Lernräume" },
  
  // Student Manage Profile
  "dashboard.student.manage.bioPlaceholder": { en: "Bio", de: "Biografie" },
  "dashboard.student.manage.clickToChange": { en: "Click to change profile picture", de: "Klicken Sie, um das Profilbild zu ändern" },
  "dashboard.student.manage.emailPlaceholder": { en: "Email", de: "E-Mail" },
  "dashboard.student.manage.firstNamePlaceholder": { en: "First Name", de: "Vorname" },
  "dashboard.student.manage.githubPlaceholder": { en: "GitHub", de: "GitHub" },
  "dashboard.student.manage.lastNamePlaceholder": { en: "Last Name", de: "Nachname" },
  "dashboard.student.manage.linkedinPlaceholder": { en: "LinkedIn", de: "LinkedIn" },
  "dashboard.student.manage.updateProfile": { en: "Update Profile", de: "Profil aktualisieren" },
  "dashboard.student.manage.updating": { en: "Updating...", de: "Wird aktualisiert..." },
  "dashboard.student.manage.usernamePlaceholder": { en: "Username", de: "Benutzername" },
  "dashboard.student.manage.websitePlaceholder": { en: "Website", de: "Website" },
  "dashboard.student.manage.youtubePlaceholder": { en: "YouTube", de: "YouTube" },
  
  // Student My Learning
  "dashboard.student.myLearning.allCourses": { en: "All Courses", de: "Alle Kurse" },
  "dashboard.student.myLearning.clearAllFilters": { en: "Clear all filters", de: "Alle Filter löschen" },
  "dashboard.student.myLearning.clearFilters": { en: "Clear Filters", de: "Filter löschen" },
  "dashboard.student.myLearning.courseCommunity.alreadyGivenFeedback": { en: "You have already given feedback for this course.", de: "Sie haben bereits Feedback für diesen Kurs gegeben." },
  "dashboard.student.myLearning.courseCommunity.askFirstQuestion": { en: "Ask your first question", de: "Stellen Sie Ihre erste Frage" },
  "dashboard.student.myLearning.courseCommunity.askQuestion": { en: "Ask Question", de: "Frage stellen" },
  "dashboard.student.myLearning.courseCommunity.askYourQuestion": { en: "Ask your question", de: "Stellen Sie Ihre Frage" },
  "dashboard.student.myLearning.courseCommunity.beFirstFeedback": { en: "No reviews yet, and you can be the first to give feedback.", de: "Noch keine Bewertungen, Sie können der Erste sein, der Feedback gibt." },
  "dashboard.student.myLearning.courseCommunity.beFirstToAsk": { en: "Be the first to ask a question about this course! Your instructor is ready to help.", de: "Seien Sie der Erste, der eine Frage zu diesem Kurs stellt! Ihr Dozent ist bereit zu helfen." },
  "dashboard.student.myLearning.courseCommunity.cancel": { en: "Cancel", de: "Abbrechen" },
  "dashboard.student.myLearning.courseCommunity.completeCourseFirst": { en: "No reviews yet. Once you complete the course and assignments, you can give feedback.", de: "Noch keine Bewertungen. Sobald Sie den Kurs und die Aufgaben abgeschlossen haben, können Sie Feedback geben." },
  "dashboard.student.myLearning.courseCommunity.enterDetails": { en: "Enter more details...", de: "Geben Sie weitere Details ein..." },
  "dashboard.student.myLearning.courseCommunity.instructorNotified": { en: "Your instructor will be notified and will respond as soon as possible", de: "Ihr Dozent wird benachrichtigt und antwortet so schnell wie möglich" },
  "dashboard.student.myLearning.courseCommunity.moreDetails": { en: "More details about the question", de: "Weitere Details zur Frage" },
  "dashboard.student.myLearning.courseCommunity.noFeedbacksYet": { en: "None of the students have given feedback yet.", de: "Noch kein Student hat Feedback gegeben." },
  "dashboard.student.myLearning.courseCommunity.noQuestionsYet": { en: "No questions yet", de: "Noch keine Fragen" },
  "dashboard.student.myLearning.courseCommunity.qna": { en: "Q&A", de: "Fragen & Antworten" },
  "dashboard.student.myLearning.courseCommunity.questionsDiscussions": { en: "Questions and Discussions", de: "Fragen und Diskussionen" },
  "dashboard.student.myLearning.courseCommunity.questionsHelp": { en: "Ask questions and get help from your instructor and fellow students", de: "Stellen Sie Fragen und erhalten Sie Hilfe von Ihrem Dozenten und Mitstudierenden" },
  "dashboard.student.myLearning.courseCommunity.reviews": { en: "Reviews", de: "Bewertungen" },
  "dashboard.student.myLearning.courseCommunity.searchQuestions": { en: "Search for questions...", de: "Nach Fragen suchen..." },
  "dashboard.student.myLearning.courseCommunity.subtitle": { en: "Ask questions, share your thoughts, and connect with other learners", de: "Stellen Sie Fragen, teilen Sie Ihre Gedanken und vernetzen Sie sich mit anderen Lernenden" },
  "dashboard.student.myLearning.courseCommunity.title": { en: "Course Community", de: "Kurs-Community" },
  "dashboard.student.myLearning.coursesText": { en: "course", de: "Kurs" },
  "dashboard.student.myLearning.filterByCategory": { en: "Filter by category", de: "Nach Kategorie filtern" },
  "dashboard.student.myLearning.noCoursesFound": { en: "No courses found", de: "Keine Kurse gefunden" },
  "dashboard.student.myLearning.noCoursesYet": { en: "No enrolled courses yet.", de: "Noch keine eingeschriebenen Kurse." },
  "dashboard.student.myLearning.of": { en: "of", de: "von" },
  "dashboard.student.myLearning.searchPlaceholder": { en: "Search in your enrolled courses...", de: "In Ihren eingeschriebenen Kursen suchen..." },
  "dashboard.student.myLearning.showing": { en: "Showing", de: "Anzeige" },
  "dashboard.student.myLearning.startBrowsing": { en: "Start Browsing", de: "Mit dem Durchsuchen beginnen" },
  "dashboard.student.myLearning.title": { en: "My Courses", de: "Meine Kurse" },
  "dashboard.student.myLearning.tryAdjusting": { en: "Try adjusting the filters or search query", de: "Versuchen Sie, die Filter oder Suchanfrage anzupassen" },
  
  // Student My Meetings
  "dashboard.student.myMeetings.all": { en: "All", de: "Alle" },
  "dashboard.student.myMeetings.amount": { en: "Amount", de: "Betrag" },
  "dashboard.student.myMeetings.availableBefore": { en: "Available 15 minutes before", de: "15 Minuten vorher verfügbar" },
  "dashboard.student.myMeetings.bookAnotherSession": { en: "Book another consultation session with our expert advisors", de: "Buchen Sie eine weitere Beratungssitzung mit unseren Expertenberatern" },
  "dashboard.student.myMeetings.bookConsultation": { en: "Book Full Consultation (99 DT)", de: "Vollständige Beratung buchen (99 DT)" },
  "dashboard.student.myMeetings.bookQuickCall": { en: "Book Quick Call (49 DT)", de: "Schnellanruf buchen (49 DT)" },
  "dashboard.student.myMeetings.cancelled": { en: "Cancelled", de: "Storniert" },
  "dashboard.student.myMeetings.confirmed": { en: "Confirmed", de: "Bestätigt" },
  "dashboard.student.myMeetings.joinMeeting": { en: "Join Meeting", de: "Meeting beitreten" },
  "dashboard.student.myMeetings.meetingCount": { en: "meeting", de: "Meeting" },
  "dashboard.student.myMeetings.meetingsCount": { en: "meetings", de: "Meetings" },
  "dashboard.student.myMeetings.needMoreGuidance": { en: "Need more guidance?", de: "Brauchen Sie weitere Anleitung?" },
  "dashboard.student.myMeetings.noMeetingsBooked": { en: "You haven't booked any meetings yet. Schedule a consultation with our experts!", de: "Sie haben noch keine Meetings gebucht. Vereinbaren Sie eine Beratung mit unseren Experten!" },
  "dashboard.student.myMeetings.noMeetingsFound": { en: "No meetings found", de: "Keine Meetings gefunden" },
  "dashboard.student.myMeetings.noMeetingsScheduled": { en: "No meetings scheduled", de: "Keine Meetings geplant" },
  "dashboard.student.myMeetings.past": { en: "Past", de: "Vergangene" },
  "dashboard.student.myMeetings.paymentPending": { en: "Payment Pending", de: "Zahlung ausstehend" },
  "dashboard.student.myMeetings.paymentVerifying": { en: "⏳ Your payment proof is being verified. You'll receive a confirmation email with the meeting link once approved (usually within 24-48 hours).", de: "⏳ Ihr Zahlungsnachweis wird überprüft. Sie erhalten eine Bestätigungs-E-Mail mit dem Meeting-Link, sobald er genehmigt wurde (normalerweise innerhalb von 24-48 Stunden)." },
  "dashboard.student.myMeetings.quickCall": { en: "Quick Call", de: "Schnellanruf" },
  "dashboard.student.myMeetings.title": { en: "My Meetings", de: "Meine Meetings" },
  "dashboard.student.myMeetings.upcoming": { en: "Upcoming", de: "Bevorstehend" },
  "dashboard.student.myMeetings.withAdvisor": { en: "with advisor", de: "mit Berater" },
  
  // Student My Resume
  "dashboard.student.myResume.beingReviewed": { en: "Your resume request is being reviewed. We'll verify your payment and start working on your resume within 24-48 hours.", de: "Ihre Lebenslaufanfrage wird überprüft. Wir werden Ihre Zahlung überprüfen und innerhalb von 24-48 Stunden mit Ihrem Lebenslauf beginnen." },
  "dashboard.student.myResume.completed": { en: "Completed", de: "Abgeschlossen" },
  "dashboard.student.myResume.crafting": { en: "Our experts are currently crafting your professional resume. Expected delivery: 1-2 business days.", de: "Unsere Experten erstellen derzeit Ihren professionellen Lebenslauf. Erwartete Lieferung: 1-2 Werktage." },
  "dashboard.student.myResume.currentRole": { en: "Current Role", de: "Aktuelle Position" },
  "dashboard.student.myResume.downloadAndApply": { en: "Download your professional resume and start applying", de: "Laden Sie Ihren professionellen Lebenslauf herunter und beginnen Sie mit der Bewerbung" },
  "dashboard.student.myResume.downloadResume": { en: "Download Resume", de: "Lebenslauf herunterladen" },
  "dashboard.student.myResume.education": { en: "Education", de: "Bildung" },
  "dashboard.student.myResume.errorFetching": { en: "Failed to fetch resume requests", de: "Fehler beim Abrufen der Lebenslaufanfragen" },
  "dashboard.student.myResume.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.student.myResume.experienceLevel": { en: "Experience Level", de: "Erfahrungslevel" },
  "dashboard.student.myResume.getGermanCV": { en: "Get a professional German-style CV (Lebenslauf) from our experts. Stand out in your job applications!", de: "Erhalten Sie einen professionellen deutschen Lebenslauf von unseren Experten. Heben Sie sich in Ihren Bewerbungen ab!" },
  "dashboard.student.myResume.inProgress": { en: "In Progress", de: "In Bearbeitung" },
  "dashboard.student.myResume.loading": { en: "Loading...", de: "Wird geladen..." },
  "dashboard.student.myResume.newRequest": { en: "New Resume Request", de: "Neue Lebenslaufanfrage" },
  "dashboard.student.myResume.noRequestsYet": { en: "No resume requests yet", de: "Noch keine Lebenslaufanfragen" },
  "dashboard.student.myResume.notApproved": { en: "This request was not approved", de: "Diese Anfrage wurde nicht genehmigt" },
  "dashboard.student.myResume.noteFromTeam": { en: "Note from our team:", de: "Notiz von unserem Team:" },
  "dashboard.student.myResume.paymentNotApproved": { en: "Payment not approved", de: "Zahlung nicht genehmigt" },
  "dashboard.student.myResume.paymentRejected": { en: "Payment Rejected", de: "Zahlung abgelehnt" },
  "dashboard.student.myResume.pendingReview": { en: "Pending Review", de: "Überprüfung ausstehend" },
  "dashboard.student.myResume.price": { en: "Price", de: "Preis" },
  "dashboard.student.myResume.professionalResume": { en: "Professional Resume", de: "Professioneller Lebenslauf" },
  "dashboard.student.myResume.reason": { en: "Reason", de: "Grund" },
  "dashboard.student.myResume.rejected": { en: "Rejected", de: "Abgelehnt" },
  "dashboard.student.myResume.requestFirst": { en: "Request your first resume", de: "Fordern Sie Ihren ersten Lebenslauf an" },
  "dashboard.student.myResume.resumeReady": { en: "Your professional resume is ready! Download it below and start applying for your dream jobs.", de: "Ihr professioneller Lebenslauf ist fertig! Laden Sie ihn unten herunter und bewerben Sie sich auf Ihre Traumjobs." },
  "dashboard.student.myResume.submitted": { en: "Submitted", de: "Eingereicht" },
  "dashboard.student.myResume.subtitle": { en: "Track your professional resume creation requests", de: "Verfolgen Sie Ihre Anfragen zur professionellen Lebenslauferstellung" },
  "dashboard.student.myResume.title": { en: "My Resume", de: "Mein Lebenslauf" },
  "dashboard.student.myResume.yourResumeReady": { en: "Your resume is ready!", de: "Ihr Lebenslauf ist fertig!" },
  
  // Student Meeting additional keys
  "dashboard.student.meeting.book": { en: "Book", de: "Buchen" },
  "dashboard.student.meeting.bookConsultation": { en: "Book Consultation", de: "Beratung buchen" },
  "dashboard.student.meeting.bookingAwaitingPayment": { en: "Booking Awaiting Payment Approval", de: "Buchung wartet auf Zahlungsbestätigung" },
  "dashboard.student.meeting.bookingCancelled": { en: "Booking Cancelled", de: "Buchung storniert" },
  "dashboard.student.meeting.bookingCancelledDesc": { en: "Your booking has been cancelled", de: "Ihre Buchung wurde storniert" },
  "dashboard.student.meeting.bookingCompleted": { en: "Meeting Completed", de: "Meeting abgeschlossen" },
  "dashboard.student.meeting.bookingDetails": { en: "Booking Details", de: "Buchungsdetails" },
  "dashboard.student.meeting.bookingSuccess": { en: "Booking Successful", de: "Buchung erfolgreich" },
  "dashboard.student.meeting.bookingSuccessDesc": { en: "Your consultation has been booked successfully", de: "Ihre Beratung wurde erfolgreich gebucht" },
  "dashboard.student.meeting.cancel": { en: "Cancel", de: "Abbrechen" },
  "dashboard.student.meeting.cancelBooking": { en: "Cancel Booking", de: "Buchung stornieren" },
  "dashboard.student.meeting.confirmationMessage": { en: "We will review your payment proof and send you the meeting link via email once approved.", de: "Wir werden Ihren Zahlungsnachweis prüfen und Ihnen den Meeting-Link per E-Mail zusenden, sobald er genehmigt wurde." },
  "dashboard.student.meeting.consultationWith": { en: "Consultation with {name}", de: "Beratung mit {name}" },
  "dashboard.student.meeting.continue": { en: "Continue", de: "Fortfahren" },
  "dashboard.student.meeting.date": { en: "Date", de: "Datum" },
  "dashboard.student.meeting.duration": { en: "Duration", de: "Dauer" },
  "dashboard.student.meeting.errorBooking": { en: "Failed to create booking", de: "Fehler beim Erstellen der Buchung" },
  "dashboard.student.meeting.errorCancelling": { en: "Failed to cancel booking", de: "Fehler beim Stornieren der Buchung" },
  "dashboard.student.meeting.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.student.meeting.free": { en: "Free", de: "Kostenlos" },
  "dashboard.student.meeting.joinMeeting": { en: "Join Meeting", de: "Meeting beitreten" },
  "dashboard.student.meeting.meetingLink": { en: "Meeting Link", de: "Meeting-Link" },
  "dashboard.student.meeting.myBookings": { en: "My Bookings", de: "Meine Buchungen" },
  "dashboard.student.meeting.noAvailability": { en: "No availability found", de: "Keine Verfügbarkeit gefunden" },
  "dashboard.student.meeting.noBookingsDesc": { en: "You haven't booked any consultations yet", de: "Sie haben noch keine Beratungen gebucht" },
  "dashboard.student.meeting.noBookingsFound": { en: "No Bookings", de: "Keine Buchungen" },
  "dashboard.student.meeting.notes": { en: "Notes", de: "Notizen" },
  "dashboard.student.meeting.notesOptional": { en: "Notes (Optional)", de: "Notizen (Optional)" },
  "dashboard.student.meeting.notesPlaceholder": { en: "Add any specific topics or questions you'd like to discuss...", de: "Fügen Sie spezifische Themen oder Fragen hinzu, die Sie besprechen möchten..." },
  "dashboard.student.meeting.paymentAwaitingApproval": { en: "Payment Awaiting Approval", de: "Zahlung wartet auf Genehmigung" },
  "dashboard.student.meeting.paymentInfo": { en: "Payment Information", de: "Zahlungsinformationen" },
  "dashboard.student.meeting.paymentMethod": { en: "Payment Method", de: "Zahlungsmethode" },
  "dashboard.student.meeting.paymentProof": { en: "Payment Proof", de: "Zahlungsnachweis" },
  "dashboard.student.meeting.paymentProofRequired": { en: "Please upload a payment proof", de: "Bitte laden Sie einen Zahlungsnachweis hoch" },
  "dashboard.student.meeting.paymentRejected": { en: "Payment Rejected", de: "Zahlung abgelehnt" },
  "dashboard.student.meeting.price": { en: "Price", de: "Preis" },
  "dashboard.student.meeting.rejectionReason": { en: "Rejection Reason", de: "Ablehnungsgrund" },
  "dashboard.student.meeting.selectDateTime": { en: "Select Date & Time", de: "Datum & Uhrzeit wählen" },
  "dashboard.student.meeting.selectTimeSlot": { en: "Select a time slot", de: "Zeitfenster wählen" },
  "dashboard.student.meeting.status": { en: "Status", de: "Status" },
  "dashboard.student.meeting.subtitle": { en: "Schedule and manage your consultation sessions", de: "Planen und verwalten Sie Ihre Beratungstermine" },
  "dashboard.student.meeting.time": { en: "Time", de: "Uhrzeit" },
  "dashboard.student.meeting.timezone": { en: "Timezone", de: "Zeitzone" },
  "dashboard.student.meeting.title": { en: "Book a Consultation", de: "Beratung buchen" },
  "dashboard.student.meeting.uploadPaymentProof": { en: "Upload Payment Proof", de: "Zahlungsnachweis hochladen" },
  "dashboard.student.meeting.view": { en: "View", de: "Ansehen" },
  "dashboard.student.meeting.viewDetails": { en: "View Details", de: "Details anzeigen" },
  
  // Student Resume additional keys
  "dashboard.student.resume.additionalNotes": { en: "Additional Notes", de: "Zusätzliche Notizen" },
  "dashboard.student.resume.additionalNotesPlaceholder": { en: "Any additional information...", de: "Zusätzliche Informationen..." },
  "dashboard.student.resume.completed": { en: "Completed", de: "Abgeschlossen" },
  "dashboard.student.resume.confirmPayment": { en: "Confirm Payment", de: "Zahlung bestätigen" },
  "dashboard.student.resume.currentCV": { en: "Current CV", de: "Aktueller Lebenslauf" },
  "dashboard.student.resume.currentCVOptional": { en: "Current CV (Optional)", de: "Aktueller Lebenslauf (Optional)" },
  "dashboard.student.resume.currentRole": { en: "Current Role", de: "Aktuelle Position" },
  "dashboard.student.resume.download": { en: "Download", de: "Herunterladen" },
  "dashboard.student.resume.downloadResume": { en: "Download Resume", de: "Lebenslauf herunterladen" },
  "dashboard.student.resume.education": { en: "Education", de: "Bildung" },
  "dashboard.student.resume.errorTitle": { en: "Error", de: "Fehler" },
  "dashboard.student.resume.experience": { en: "Experience (years)", de: "Erfahrung (Jahre)" },
  "dashboard.student.resume.myRequests": { en: "My Resume Requests", de: "Meine Lebenslaufanfragen" },
  "dashboard.student.resume.noRequestsDesc": { en: "You haven't requested any resume services yet", de: "Sie haben noch keine Lebenslauf-Services angefragt" },
  "dashboard.student.resume.noRequestsFound": { en: "No Requests", de: "Keine Anfragen" },
  "dashboard.student.resume.paymentProof": { en: "Payment Proof", de: "Zahlungsnachweis" },
  "dashboard.student.resume.paymentProofRequired": { en: "Please upload a payment proof", de: "Bitte laden Sie einen Zahlungsnachweis hoch" },
  "dashboard.student.resume.pendingPayment": { en: "Pending Payment", de: "Ausstehende Zahlung" },
  "dashboard.student.resume.price": { en: "Price: {price} TND", de: "Preis: {price} TND" },
  "dashboard.student.resume.requestCreatedDesc": { en: "Your resume request has been submitted", de: "Ihre Lebenslaufanfrage wurde übermittelt" },
  "dashboard.student.resume.requestFailed": { en: "Failed to submit request", de: "Fehler beim Senden der Anfrage" },
  "dashboard.student.resume.requestSuccess": { en: "Request Submitted", de: "Anfrage übermittelt" },
  "dashboard.student.resume.skills": { en: "Skills", de: "Fähigkeiten" },
  "dashboard.student.resume.skillsPlaceholder": { en: "e.g., JavaScript, React, Node.js", de: "z.B. JavaScript, React, Node.js" },
  "dashboard.student.resume.status": { en: "Status", de: "Status" },
  "dashboard.student.resume.submitRequest": { en: "Submit Request", de: "Anfrage senden" },
  "dashboard.student.resume.subtitle": { en: "Get a professionally crafted resume tailored to your target role", de: "Erhalten Sie einen professionell gestalteten Lebenslauf für Ihre Zielposition" },
  "dashboard.student.resume.targetRole": { en: "Target Role", de: "Zielposition" },
  "dashboard.student.resume.title": { en: "Resume Service", de: "Lebenslauf-Service" },
  "dashboard.student.resume.uploadCV": { en: "Upload CV", de: "Lebenslauf hochladen" },
  "dashboard.student.resume.uploadPaymentProof": { en: "Upload Payment Proof", de: "Zahlungsnachweis hochladen" },
  "dashboard.student.resume.view": { en: "View", de: "Ansehen" },
  "dashboard.student.resume.viewDetails": { en: "View Details", de: "Details anzeigen" },
  "dashboard.student.resume.yourInformation": { en: "Your Information", de: "Ihre Informationen" }
};

function applyTranslations() {
  console.log('🔧 Applying complete translations...\n');
  
  // Load existing translation files
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  const dePath = path.join(MESSAGES_DIR, 'de.json');
  
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const deContent = JSON.parse(fs.readFileSync(dePath, 'utf-8'));
  
  let enAdded = 0;
  let deAdded = 0;
  
  // Add missing translations
  for (const [key, values] of Object.entries(completeTranslations)) {
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
  
  // Write back to files with proper formatting
  fs.writeFileSync(enPath, JSON.stringify(enContent, null, 2) + '\n');
  fs.writeFileSync(dePath, JSON.stringify(deContent, null, 2) + '\n');
  
  console.log(`✅ Added ${enAdded} translations to EN`);
  console.log(`✅ Added ${deAdded} translations to DE\n`);
  console.log(`📊 Total translations in map: ${Object.keys(completeTranslations).length}`);
  
  return { enAdded, deAdded };
}

if (require.main === module) {
  applyTranslations();
}

export { applyTranslations, completeTranslations };
