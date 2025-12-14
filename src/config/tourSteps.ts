import { Step } from 'react-joyride';

export const adminTourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your Dashboard! Get a quick overview of your institution with key statistics, recent activities, and pending actions.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="students"]',
    content: 'Manage all student records here. Add new students, view profiles, track attendance, and manage enrollments.',
    placement: 'right',
  },
  {
    target: '[data-tour="courses"]',
    content: 'Create and manage courses, assign subjects, and configure semester structures for your institution.',
    placement: 'right',
  },
  {
    target: '[data-tour="fees"]',
    content: 'Handle all fee-related operations. Collect fees, generate receipts, track pending payments, and view financial reports.',
    placement: 'right',
  },
  {
    target: '[data-tour="reports"]',
    content: 'Generate comprehensive reports for students, fees, attendance, and more. Export data in various formats.',
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-toggle"]',
    content: 'Click here to expand/collapse the sidebar for more workspace.',
    placement: 'right',
  },
];

export const teacherTourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your Teacher Dashboard! View your classes, upcoming sessions, and student performance at a glance.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="students"]',
    content: 'Access student information for your classes. View profiles, contact details, and academic history.',
    placement: 'right',
  },
  {
    target: '[data-tour="attendance"]',
    content: 'Mark and manage attendance for your classes. Track student attendance patterns and generate reports.',
    placement: 'right',
  },
  {
    target: '[data-tour="exams"]',
    content: 'Create exams, manage question papers, and enter student results. View performance analytics.',
    placement: 'right',
  },
];

export const studentTourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your Student Portal! View your academic progress, attendance, and important notifications here.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile"]',
    content: 'View and update your personal information, contact details, and profile picture.',
    placement: 'right',
  },
  {
    target: '[data-tour="my-course"]',
    content: 'Access your enrolled course details, subjects, and class schedule.',
    placement: 'right',
  },
  {
    target: '[data-tour="results"]',
    content: 'Check your exam results, grades, and academic performance history.',
    placement: 'right',
  },
  {
    target: '[data-tour="tests"]',
    content: 'Take online tests and MCQ exams assigned by your teachers.',
    placement: 'right',
  },
];

export const clerkTourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to your Dashboard! Manage daily administrative tasks efficiently from here.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="enquiries"]',
    content: 'Handle admission enquiries, track follow-ups, and convert leads into admissions.',
    placement: 'right',
  },
  {
    target: '[data-tour="fees"]',
    content: 'Collect fees from students, generate receipts, and manage payment records.',
    placement: 'right',
  },
  {
    target: '[data-tour="id-cards"]',
    content: 'Generate and print student ID cards with customizable templates.',
    placement: 'right',
  },
];

export const superAdminTourSteps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'Welcome to the Super Admin Dashboard! Monitor all colleges, revenue, and system-wide analytics.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[data-tour="colleges"]',
    content: 'Manage all registered colleges. Add new institutions, configure settings, and monitor their performance.',
    placement: 'right',
  },
  {
    target: '[data-tour="amc-revenue"]',
    content: 'Track Annual Maintenance Contract revenue, payments, and billing for all colleges.',
    placement: 'right',
  },
  {
    target: '[data-tour="analytics"]',
    content: 'View comprehensive system analytics, usage patterns, and performance metrics across all institutions.',
    placement: 'right',
  },
  {
    target: '[data-tour="user-management"]',
    content: 'Manage user accounts, roles, and permissions across the entire platform.',
    placement: 'right',
  },
];

export const getTourStepsForRole = (role: string | null): Step[] => {
  switch (role) {
    case 'super_admin':
      return superAdminTourSteps;
    case 'admin':
      return adminTourSteps;
    case 'teacher':
      return teacherTourSteps;
    case 'student':
      return studentTourSteps;
    case 'clerk':
    case 'accountant':
      return clerkTourSteps;
    case 'librarian':
      return [
        {
          target: '[data-tour="dashboard"]',
          content: 'Welcome to your Library Dashboard! Manage books, track issues, and monitor library operations.',
          placement: 'right',
          disableBeacon: true,
        },
        {
          target: '[data-tour="library"]',
          content: 'Manage your book inventory, issue/return books, and track overdue items.',
          placement: 'right',
        },
      ];
    default:
      return adminTourSteps;
  }
};

export const featureSlides = [
  {
    title: 'Student Management',
    description: 'Comprehensive student records, enrollment tracking, and profile management in one place.',
    icon: 'GraduationCap',
  },
  {
    title: 'Fee Collection',
    description: 'Streamlined fee collection with receipt generation, payment tracking, and financial reports.',
    icon: 'IndianRupee',
  },
  {
    title: 'Attendance Tracking',
    description: 'Mark and monitor student attendance with detailed reports and notifications.',
    icon: 'ClipboardCheck',
  },
  {
    title: 'Exam Management',
    description: 'Create exams, manage results, and track academic performance effortlessly.',
    icon: 'FileText',
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate comprehensive reports and gain insights with powerful analytics.',
    icon: 'BarChart3',
  },
];
