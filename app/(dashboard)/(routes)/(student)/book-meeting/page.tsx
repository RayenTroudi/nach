import { BookMeetingButton } from "@/components/shared";
import { currentUser } from "@clerk/nextjs/server";
import { Container } from "@/components/shared";

const BookingDemoPage = async () => {
  const user = await currentUser();

  // For demonstration purposes, use the first instructor/admin ID
  // In production, this would come from the instructor's profile
  const DEFAULT_HOST_ID = "675b6eb1a0d2a4e540c1d7f0"; // Replace with actual instructor MongoDB ID

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Book a <span className="text-brand-red-500">Meeting</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Schedule a one-on-one consultation with our expert advisors
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">What to Expect</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <strong>Personalized Guidance</strong>
                  <p className="text-sm text-muted-foreground">
                    Get tailored advice for your specific situation
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <strong>Video Call</strong>
                  <p className="text-sm text-muted-foreground">
                    Face-to-face consultation via secure video conferencing
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <strong>Email Reminders</strong>
                  <p className="text-sm text-muted-foreground">
                    Automatic reminders 30 minutes before and at meeting time
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <strong>30-Minute Session</strong>
                  <p className="text-sm text-muted-foreground">
                    Focused discussion on your questions and goals
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 rounded-lg border">
            <h2 className="text-2xl font-semibold mb-4">Ready to Book?</h2>
            <p className="text-muted-foreground mb-6">
              Choose an available time slot that works best for you. Our advisors are
              available Monday through Friday, 9 AM to 5 PM (CET).
            </p>
            <BookMeetingButton
              hostId={DEFAULT_HOST_ID}
              hostName="Germany Formation Team"
              variant="default"
              size="lg"
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">📝 Important Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Please ensure you have a stable internet connection for the video call</li>
            <li>• Prepare any questions or documents you&apos;d like to discuss in advance</li>
            <li>• You&apos;ll receive a confirmation email with the meeting link immediately after booking</li>
            <li>• You can cancel or reschedule up to 24 hours before the meeting</li>
          </ul>
        </div>
      </div>
    </Container>
  );
};

export default BookingDemoPage;
