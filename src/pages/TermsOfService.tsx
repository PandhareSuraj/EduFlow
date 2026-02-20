import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 1, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using {APP_CONFIG.name} ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. These terms apply to all users, including institutional administrators, faculty, staff, and students.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Service Description</h2>
            <p>{APP_CONFIG.name} is a cloud-based education management platform that provides tools for student management, attendance tracking, fee collection, examination management, library management, hostel & transport administration, placement tracking, and institutional analytics.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts & Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>Institutional administrators are responsible for managing user access within their institution.</li>
              <li>You must notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable regulations.</li>
              <li>Attempt to gain unauthorized access to other users' accounts or institutional data.</li>
              <li>Upload malicious software, viruses, or harmful code.</li>
              <li>Interfere with or disrupt the Platform's infrastructure or services.</li>
              <li>Scrape, harvest, or collect data from the Platform without authorization.</li>
              <li>Share login credentials with unauthorized individuals.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p>The Platform, including its design, features, code, documentation, and branding, is the intellectual property of {APP_CONFIG.name} and its licensors. You may not copy, modify, distribute, or create derivative works of the Platform without our written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Data Ownership</h2>
            <p>Institutions retain full ownership of all data they input into the Platform, including student records, faculty data, financial records, and academic information. We act as a data processor on behalf of the institution. Upon termination of service, institutions may request an export of their data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Service Availability</h2>
            <p>We strive to maintain 99.9% platform uptime. However, we do not guarantee uninterrupted access and may perform scheduled maintenance with advance notice. We are not liable for downtime caused by factors beyond our reasonable control, including internet outages, natural disasters, or third-party service failures.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Fees & Payment</h2>
            <p>Subscription fees are as outlined in your institutional agreement. Fees are non-refundable unless otherwise stated in your service agreement. We reserve the right to modify pricing with 30 days' prior notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, {APP_CONFIG.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount paid by you for the service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Termination</h2>
            <p>Either party may terminate the service agreement with 30 days' written notice. We may suspend or terminate access immediately if you violate these terms. Upon termination, your right to use the Platform ceases, and we will provide a reasonable period to export your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">12. Contact Us</h2>
            <p>For questions about these Terms of Service, please contact us:</p>
            <ul className="list-none mt-2 space-y-1">
              <li>Email: <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary hover:underline">{APP_CONFIG.supportEmail}</a></li>
              <li>Phone: {APP_CONFIG.supportPhone}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
