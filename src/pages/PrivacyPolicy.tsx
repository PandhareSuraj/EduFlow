import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { APP_CONFIG } from '@/config/appConfig';

export default function PrivacyPolicy() {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: February 1, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>{APP_CONFIG.name} ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cloud-based education management platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect information in the following categories:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Institutional Data:</strong> College name, address, contact details, branding preferences, and administrative configurations.</li>
              <li><strong>Student Data:</strong> Name, enrollment number, contact information, academic records, attendance, fee payment history, and hostel/transport allocations.</li>
              <li><strong>Faculty & Staff Data:</strong> Name, employee ID, department, qualifications, and contact information.</li>
              <li><strong>Usage Analytics:</strong> Pages visited, features used, session duration, device type, and browser information to improve our services.</li>
              <li><strong>Authentication Data:</strong> Email addresses, encrypted passwords, and session tokens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, operate, and maintain the education management platform.</li>
              <li>Process student enrollment, attendance tracking, fee management, and academic records.</li>
              <li>Generate reports, analytics, and performance insights for institutions.</li>
              <li>Send notifications related to fees, attendance alerts, exam schedules, and system updates.</li>
              <li>Improve our platform's functionality, performance, and user experience.</li>
              <li>Ensure platform security and prevent unauthorized access.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard cloud infrastructure with encryption at rest and in transit. We employ row-level security (RLS) policies to ensure that each institution can only access its own data. Regular backups and access controls are maintained to protect against data loss and unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data only in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Service Providers:</strong> Trusted third-party services that assist in operating our platform (e.g., cloud hosting, email delivery), bound by confidentiality agreements.</li>
              <li><strong>Legal Compliance:</strong> When required by law, regulation, or legal process.</li>
              <li><strong>Institutional Authorization:</strong> Data shared within the institution as authorized by the institution's administrators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Student Data Protection</h2>
            <p>We recognize the sensitivity of student educational records. Our platform is designed with student data privacy as a core principle. Institutions retain full ownership and control of their student data, and we process it only as directed by the institution.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookies & Tracking</h2>
            <p>We use essential cookies to maintain your session and authentication state. We may use analytics cookies to understand platform usage patterns. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal and contractual obligations.</li>
              <li><strong>Data Portability:</strong> Request your data in a structured, commonly used format.</li>
            </ul>
            <p className="mt-2">Institutional administrators can manage most data requests directly through the platform. For additional requests, contact us at <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-primary hover:underline">{APP_CONFIG.supportEmail}</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of material changes via email or an in-platform notice. Continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
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
