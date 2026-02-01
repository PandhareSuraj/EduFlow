export const APP_CONFIG = {
  name: 'EduFlow',
  version: '2.0.0',
  supportEmail: 'support@eduflow.com',
  supportPhone: '+91 1800-XXX-XXXX',
  releaseDate: '2026-02-01',
  documentationUrl: '/product-tour',
  whatsNew: [
    {
      version: '2.0.0',
      date: '2026-02-01',
      title: 'Major Update: Enhanced Export & Mobile Experience',
      changes: [
        'Export to Excel and PDF with date range filters',
        'Bottom navigation for mobile devices',
        'Pull-to-refresh on list pages',
        'Improved accessibility with ARIA labels',
        'Enhanced print stylesheets',
      ],
    },
    {
      version: '1.9.0',
      date: '2026-01-15',
      title: 'Student Promotion & Academic Years',
      changes: [
        'Bulk student promotion system',
        'Academic year management',
        'Promotion history and rollback',
        'Validation checks before promotion',
      ],
    },
    {
      version: '1.8.0',
      date: '2026-01-01',
      title: 'Placements & Events Module',
      changes: [
        'Placement drive management',
        'Interview scheduling',
        'Event calendar with registrations',
        'Student application tracking',
      ],
    },
    {
      version: '1.7.0',
      date: '2025-12-15',
      title: 'Library & Inventory Management',
      changes: [
        'Complete library catalog system',
        'Book issue and return tracking',
        'Inventory management with transactions',
        'Low stock alerts',
      ],
    },
  ],
};

export type WhatsNewItem = typeof APP_CONFIG.whatsNew[number];
