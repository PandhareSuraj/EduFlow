import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { InquiryFormDialog } from '@/components/lead-generation';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How long does it take to set up EduFlow for my institution?',
        a: 'Most institutions are up and running within 24-48 hours. Our onboarding team handles data migration, user setup, and provides personalized training. For larger institutions with complex requirements, setup may take up to a week.',
      },
      {
        q: 'Do I need any technical expertise to use EduFlow?',
        a: 'Not at all! EduFlow is designed for educators, not IT professionals. The interface is intuitive and user-friendly. We also provide comprehensive training, video tutorials, and 24/7 support to help you get started.',
      },
      {
        q: 'Can I import existing student and faculty data?',
        a: 'Yes! EduFlow supports bulk data import from Excel, CSV, and most common formats. Our team can also help migrate data from your existing systems, including legacy software, spreadsheets, or even paper records.',
      },
    ],
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        q: 'Does EduFlow support multiple campuses or branches?',
        a: 'Absolutely! EduFlow\'s multi-campus architecture allows you to manage multiple branches from a single dashboard while maintaining separate data, reports, and user access for each campus.',
      },
      {
        q: 'Can parents access student information?',
        a: 'Yes, EduFlow includes a dedicated parent portal where parents can view attendance, grades, fee status, and communicate with teachers. You have full control over what information is visible to parents.',
      },
      {
        q: 'Is there a mobile app for EduFlow?',
        a: 'EduFlow is fully responsive and works seamlessly on any device. We also offer dedicated mobile apps for Android and iOS for teachers and students with features like attendance marking, push notifications, and more.',
      },
      {
        q: 'Can I customize EduFlow to match my institution\'s workflow?',
        a: 'Yes! EduFlow offers extensive customization options including custom fields, flexible fee structures, configurable grading systems, and role-based access control. Our team can also develop custom features for your specific needs.',
      },
    ],
  },
  {
    category: 'Pricing & Support',
    questions: [
      {
        q: 'What does EduFlow cost?',
        a: 'EduFlow offers flexible pricing based on your institution size and requirements. We have plans starting from ₹5,000/month for small institutions. Contact us for a customized quote based on your specific needs.',
      },
      {
        q: 'Is there a free trial available?',
        a: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can also request a personalized demo where our team walks you through the platform.',
      },
      {
        q: 'What kind of support do you provide?',
        a: 'We offer 24/7 support via chat, email, and phone. All plans include access to our knowledge base, video tutorials, and community forum. Premium plans include dedicated account managers and priority support.',
      },
      {
        q: 'What happens to my data if I decide to cancel?',
        a: 'Your data belongs to you. If you decide to cancel, we provide a complete export of all your data in standard formats. We retain backups for 30 days after cancellation in case you change your mind.',
      },
    ],
  },
  {
    category: 'Security & Compliance',
    questions: [
      {
        q: 'Is my data secure with EduFlow?',
        a: 'Security is our top priority. EduFlow uses bank-grade encryption, secure data centers, regular backups, and complies with industry standards. We conduct regular security audits and penetration testing.',
      },
      {
        q: 'Is EduFlow compliant with educational regulations?',
        a: 'Yes, EduFlow is designed to comply with educational regulations in India including UGC, AICTE, and state education board requirements. We also support GST compliance for fee management.',
      },
    ],
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="h-3 w-3 mr-1" />
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about EduFlow. Can't find what you're looking for?{' '}
            <InquiryFormDialog title="Contact Our Team" description="Have a question that's not answered here? Reach out and we'll help you.">
              <Button variant="link" className="p-0 h-auto text-lg">Contact our team</Button>
            </InquiryFormDialog>
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {category.category}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${categoryIndex}-${faqIndex}`}
                    className="bg-background border rounded-lg px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium pr-4">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-background border rounded-xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Still have questions?</p>
              <p className="text-sm text-muted-foreground">Our team is here to help</p>
            </div>
            <InquiryFormDialog title="Contact Support" description="Our support team is ready to help you with any questions.">
              <Button className="ml-4">
                Contact Support
              </Button>
            </InquiryFormDialog>
          </div>
        </div>
      </div>
    </section>
  );
}
