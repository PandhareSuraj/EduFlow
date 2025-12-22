import { Step } from 'react-joyride';

// Super Admin tour steps
export const superAdminSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to the Super Admin Dashboard! Here you can manage all colleges, monitor system health, and oversee the entire platform.',
    title: 'Your Command Center',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-grid"]',
    content: 'View key metrics at a glance - total colleges, AMC revenue, student count, and active users across all institutions.',
    title: 'Platform Overview',
    placement: 'bottom',
  },
  {
    target: '[data-tour="nav-colleges"]',
    content: 'Manage all colleges in your network - add new institutions, configure settings, and monitor their status.',
    title: 'College Management',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-amc"]',
    content: 'Track and manage Annual Maintenance Contract payments from all colleges.',
    title: 'AMC Revenue',
    placement: 'right',
  },
  {
    target: '[data-tour="header-notifications"]',
    content: 'Stay updated with important alerts and notifications from across the platform.',
    title: 'Notifications',
    placement: 'bottom',
  },
];

// Admin tour steps
export const adminSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to your College Administration Dashboard! This is your central hub for managing all aspects of your institution.',
    title: 'Your Dashboard',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-grid"]',
    content: 'View real-time statistics - total students, active courses, monthly revenue, and faculty count at a glance.',
    title: 'Key Metrics',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quick access to common tasks - add students, collect fees, mark attendance, and create exams.',
    title: 'Quick Actions',
    placement: 'top',
  },
  {
    target: '[data-tour="pending-actions"]',
    content: 'Keep track of items needing your attention - pending fees, low attendance alerts, and more.',
    title: 'Pending Actions',
    placement: 'left',
  },
  {
    target: '[data-tour="nav-students"]',
    content: 'Manage student records, admissions, and academic information.',
    title: 'Student Management',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-fees"]',
    content: 'Handle fee collection, payment tracking, and financial reports.',
    title: 'Fee Management',
    placement: 'right',
  },
  {
    target: '[data-tour="header-search"]',
    content: 'Quickly find students, courses, or faculty using the global search.',
    title: 'Global Search',
    placement: 'bottom',
  },
  {
    target: '[data-tour="header-notifications"]',
    content: 'Never miss important updates - exam schedules, fee reminders, and system alerts.',
    title: 'Notifications',
    placement: 'bottom',
  },
];

// Teacher/Faculty tour steps
export const teacherSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to your Teaching Portal! Manage your classes, mark attendance, and track student progress all in one place.',
    title: 'Your Teaching Hub',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-grid"]',
    content: 'View your teaching statistics - total classes, students, and average attendance rate.',
    title: 'Your Stats',
    placement: 'bottom',
  },
  {
    target: '[data-tour="today-schedule"]',
    content: 'See your classes for today with timings, rooms, and subjects at a glance.',
    title: "Today's Schedule",
    placement: 'right',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quick access to mark attendance, view reports, and manage exams.',
    title: 'Quick Actions',
    placement: 'left',
  },
  {
    target: '[data-tour="nav-attendance"]',
    content: 'Mark and manage student attendance for all your classes.',
    title: 'Attendance',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-exams"]',
    content: 'Create and manage exams, enter marks, and view results.',
    title: 'Exams',
    placement: 'right',
  },
  {
    target: '[data-tour="header-notifications"]',
    content: 'Get notified about schedule changes, exam deadlines, and more.',
    title: 'Notifications',
    placement: 'bottom',
  },
];

// Accountant tour steps
export const accountantSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to the Finance Management Center! Track collections, manage fees, and generate financial reports.',
    title: 'Finance Dashboard',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-grid"]',
    content: 'Monitor key financial metrics - monthly collections, pending fees, and payment trends.',
    title: 'Financial Overview',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quickly collect fees, view payment history, and access financial reports.',
    title: 'Quick Actions',
    placement: 'top',
  },
  {
    target: '[data-tour="nav-fees"]',
    content: 'Complete fee management - collect payments, track dues, and manage installments.',
    title: 'Fee Management',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-reports"]',
    content: 'Generate detailed financial reports and analytics.',
    title: 'Reports',
    placement: 'right',
  },
  {
    target: '[data-tour="header-notifications"]',
    content: 'Stay updated on overdue payments and collection reminders.',
    title: 'Notifications',
    placement: 'bottom',
  },
];

// Librarian tour steps
export const librarianSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to the Library Management System! Manage books, track issues, and monitor library activities.',
    title: 'Library Dashboard',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats-grid"]',
    content: 'View library statistics - total books, available copies, issued books, and overdue items.',
    title: 'Library Stats',
    placement: 'bottom',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quick access to issue books, process returns, and manage the catalog.',
    title: 'Quick Actions',
    placement: 'top',
  },
  {
    target: '[data-tour="nav-library"]',
    content: 'Complete library management - books, categories, issues, and returns.',
    title: 'Library',
    placement: 'right',
  },
  {
    target: '[data-tour="nav-inventory"]',
    content: 'Manage library inventory and stock.',
    title: 'Inventory',
    placement: 'right',
  },
  {
    target: '[data-tour="header-notifications"]',
    content: 'Get alerts for overdue books and pending returns.',
    title: 'Notifications',
    placement: 'bottom',
  },
];

// Student tour steps
export const studentSteps: Step[] = [
  {
    target: '[data-tour="welcome-header"]',
    content: 'Welcome to your Student Portal! Access your academic information, view results, and stay updated with college activities.',
    title: 'Your Student Portal',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-card"]',
    content: 'View and manage your personal and contact information.',
    title: 'Your Profile',
    placement: 'bottom',
  },
  {
    target: '[data-tour="academic-info"]',
    content: 'Track your current year, semester, and academic status.',
    title: 'Academic Info',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications-section"]',
    content: 'Enable push notifications to receive exam reminders and important updates even when the app is closed.',
    title: 'Push Notifications',
    placement: 'top',
  },
  {
    target: '[data-tour="fee-status"]',
    content: 'Check your fee payment status and upcoming dues.',
    title: 'Fee Status',
    placement: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    content: 'Quick access to your profile, courses, results, and MCQ tests.',
    title: 'Quick Actions',
    placement: 'top',
  },
];

// Get tour steps based on user role
export const getTourSteps = (role: string | null): Step[] => {
  switch (role) {
    case 'super_admin':
      return superAdminSteps;
    case 'admin':
      return adminSteps;
    case 'teacher':
      return teacherSteps;
    case 'accountant':
      return accountantSteps;
    case 'librarian':
      return librarianSteps;
    case 'student':
      return studentSteps;
    default:
      return adminSteps;
  }
};

// Role-specific welcome content
export const getWelcomeContent = (role: string | null) => {
  switch (role) {
    case 'super_admin':
      return {
        title: 'Welcome to the Multi-College Management Portal',
        description: 'Manage all colleges, monitor system health, and oversee platform-wide operations from one central dashboard.',
        features: ['Manage multiple colleges', 'Track AMC revenue', 'Monitor system analytics', 'User management'],
      };
    case 'admin':
      return {
        title: 'Welcome to Your College Administration Dashboard',
        description: 'Your central hub for managing students, faculty, fees, and all academic operations.',
        features: ['Student management', 'Fee collection', 'Attendance tracking', 'Exam management'],
      };
    case 'teacher':
      return {
        title: 'Welcome to Your Teaching Portal',
        description: 'Manage your classes, track attendance, and monitor student progress efficiently.',
        features: ['Class schedule', 'Mark attendance', 'Create exams', 'View reports'],
      };
    case 'accountant':
      return {
        title: 'Welcome to the Finance Management Center',
        description: 'Handle fee collections, track payments, and generate financial reports with ease.',
        features: ['Fee collection', 'Payment tracking', 'Financial reports', 'Due alerts'],
      };
    case 'librarian':
      return {
        title: 'Welcome to the Library Management System',
        description: 'Manage books, track issues and returns, and maintain library records efficiently.',
        features: ['Book catalog', 'Issue & return', 'Member management', 'Overdue tracking'],
      };
    case 'student':
      return {
        title: 'Welcome to Your Student Portal',
        description: 'Access your academic information, view results, and stay connected with your college.',
        features: ['View results', 'Check attendance', 'Fee status', 'Take MCQ tests'],
      };
    default:
      return {
        title: 'Welcome!',
        description: 'Get started with your personalized dashboard.',
        features: ['Dashboard overview', 'Quick actions', 'Notifications'],
      };
  }
};
