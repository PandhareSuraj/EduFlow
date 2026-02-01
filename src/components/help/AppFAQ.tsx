import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  q: string;
  a: string;
  action?: { label: string; route: string };
}

interface FAQCategory {
  category: string;
  questions: FAQItem[];
}

const appFaqs: FAQCategory[] = [
  {
    category: 'Students',
    questions: [
      {
        q: 'How do I add a new student?',
        a: 'Go to Students page and click the "Add Student" button in the top right. Fill in the required details including name, course, and contact information. The student ID will be auto-generated.',
        action: { label: 'Go to Students', route: '/students' },
      },
      {
        q: 'How do I create login credentials for a student?',
        a: 'In the Students page, find the student in the list and click the user icon button. You can create a login using their email or mobile number.',
      },
      {
        q: 'How do I generate a student ID card?',
        a: 'Navigate to the ID Cards page, select a student, choose a template, and click Generate. You can print or download the ID card as PDF.',
        action: { label: 'Go to ID Cards', route: '/id-cards' },
      },
    ],
  },
  {
    category: 'Attendance',
    questions: [
      {
        q: 'How do I record attendance?',
        a: 'Navigate to the Attendance page and click "Mark Attendance". Select the course and date, then mark each student as Present, Absent, or Late. Click Save to record.',
        action: { label: 'Go to Attendance', route: '/attendance' },
      },
      {
        q: 'Can I edit past attendance records?',
        a: 'Yes, you can edit attendance within 7 days of the session date. Go to the session details and click Edit to modify records.',
      },
      {
        q: 'How do I view attendance reports?',
        a: 'In the Attendance page, switch to the "Reports" tab. You can view daily summaries, course-wise reports, or individual student attendance records.',
      },
    ],
  },
  {
    category: 'Fees',
    questions: [
      {
        q: 'How do I generate a fee receipt?',
        a: 'After collecting a payment, click the Receipt icon on the payment row. You can download or print the receipt directly. Receipts are auto-generated with unique numbers.',
        action: { label: 'Go to Fees', route: '/fees' },
      },
      {
        q: 'How do I set up a fee structure?',
        a: 'Go to Settings > Fee Structure to define fee types, amounts, and due dates for each course. You can create installment plans as well.',
        action: { label: 'Go to Settings', route: '/settings' },
      },
      {
        q: 'How do I track pending fees?',
        a: 'The Fees page shows all student fee records with status indicators. Use the filters to view only pending or overdue payments.',
      },
    ],
  },
  {
    category: 'Reports & Exports',
    questions: [
      {
        q: 'How do I export data to Excel?',
        a: 'On any page with a data table, click the "Export" button and select "Export to Excel". You can apply filters before exporting to get specific data.',
      },
      {
        q: 'Can I export data with date range filters?',
        a: 'Yes! Click "Export" and select "Export with Date Range". Choose your from and to dates, then select Excel or PDF format.',
      },
      {
        q: 'How do I generate student report cards?',
        a: 'Go to the Exams page, find the student\'s results, and click the Report Card button. You can download individual or bulk report cards.',
        action: { label: 'Go to Exams', route: '/exams' },
      },
    ],
  },
  {
    category: 'Library',
    questions: [
      {
        q: 'How do I issue a book to a student?',
        a: 'In the Library page, click "Issue Book". Search for the book and member, then confirm the issue. Due dates are auto-calculated based on your settings.',
        action: { label: 'Go to Library', route: '/library' },
      },
      {
        q: 'How do I track overdue books?',
        a: 'The Library dashboard shows overdue books at a glance. You can also filter issued books by "Overdue" status to see all pending returns.',
      },
    ],
  },
];

export function AppFAQ() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Close the sheet by dispatching escape key
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  };

  const handleNavigate = (route: string) => {
    handleClose();
    navigate(route);
  };

  return (
    <div className="space-y-6">
      {appFaqs.map((category, idx) => (
        <div key={idx}>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            {category.category}
          </h4>
          <Accordion type="single" collapsible className="space-y-2">
            {category.questions.map((faq, faqIdx) => (
              <AccordionItem
                key={faqIdx}
                value={`${idx}-${faqIdx}`}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left text-sm py-3 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  <p>{faq.a}</p>
                  {faq.action && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2"
                      onClick={() => handleNavigate(faq.action!.route)}
                    >
                      {faq.action.label} →
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
