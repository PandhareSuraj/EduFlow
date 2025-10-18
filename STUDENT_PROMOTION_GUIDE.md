# Student Promotion System - Implementation Guide

## Overview
The Student Promotion System is a comprehensive feature that enables automated promotion of students from one academic year/semester to the next, with eligibility criteria checking and rollback capabilities.

## Architecture

### Database Schema (Phase 1)
- **academic_years**: Stores academic year definitions with start/end dates
- **student_academic_history**: Tracks promotion history for each student
- **promotion_jobs**: Manages promotion batch jobs with status tracking
- **promotion_job_events**: Logs events for audit trail
- **student_fee_assignments**: (Future use) Links students to fee structures based on their academic level
- **fee_structures**: Extended with versioning support for managing different fee structures

### Backend Edge Functions (Phase 2)
Three serverless functions handle the promotion workflow:

1. **initiate-promotion**: Creates a promotion job with specified criteria
   - Accepts filters (course_ids, year, semester)
   - Accepts eligibility criteria (attendance %, marks %, fee payment check)
   - Supports dry run mode for preview

2. **process-promotion**: Executes the promotion logic
   - Fetches eligible students based on filters
   - Checks eligibility criteria for each student
   - Calculates next year/semester using database function
   - Updates student records (if not dry run)
   - Creates academic history records
   - Returns detailed results with student-level breakdown

3. **rollback-promotion**: Reverses a completed promotion
   - Validates rollback window (default 24 hours)
   - Restores previous year/semester for all promoted students
   - Marks history records as rolled back
   - Logs rollback event

### Frontend Components (Phase 3)

#### Hooks
- **useAcademicYears**: Manages academic year CRUD operations
- **usePromotion**: Handles promotion job operations

#### Components
- **AcademicYearManagement**: UI for creating and managing academic years
- **AcademicYearDialog**: Form dialog for academic year creation/editing
- **PromotionConfigDialog**: Configuration wizard for setting up promotion criteria
- **PromotionJobsList**: Displays promotion history with actions
- **PromotionResultsDialog**: Shows detailed results with eligible/ineligible students
- **StudentPromotion**: Main page component that ties everything together

### Integration (Phase 4)
- Added route `/student-promotion` accessible to admins and super admins
- Integrated in sidebar navigation under "Student Promotion"
- Added quick action buttons in admin and super admin dashboards
- Protected route ensures only authorized users can access

## Usage Workflow

### 1. Setup Academic Years
Before running promotions, create academic years:
- Navigate to Student Promotion → Academic Years tab
- Click "Add Academic Year"
- Enter year code (e.g., "2024-2025")
- Set start and end dates
- Mark as current year if applicable

### 2. Configure Promotion
To start a new promotion:
- Click "Start Promotion" button
- Select target academic year
- (Optional) Add filters for specific courses, years, or semesters
- Set eligibility criteria:
  - Minimum attendance percentage
  - Minimum marks percentage
  - Check fee payment status
- Enable "Dry run" to preview results first

### 3. Review Dry Run Results
After dry run completes:
- View the results to see eligible and ineligible students
- Review reasons for ineligibility
- Check if any students are graduating
- Click "Execute" to confirm and run the actual promotion

### 4. Execute Promotion
When executing the promotion:
- Student records are updated with new year/semester
- Academic history records are created
- Fee assignments can be created (if configured)
- Results are logged for audit trail

### 5. Rollback (if needed)
If promotion was executed in error:
- Navigate to promotion history
- Find the completed job (within rollback window)
- Click "Rollback" to reverse the promotion
- All students will be restored to previous year/semester

## Key Features

### Eligibility Criteria
The system supports multiple criteria for determining student eligibility:
- **Attendance Percentage**: Minimum attendance required (e.g., 75%)
- **Marks Percentage**: Minimum exam performance required (e.g., 40%)
- **Fee Payment**: Check if all fees are paid before promotion

### Automatic Year/Semester Calculation
The system automatically:
- Determines the next year and semester based on course duration
- Identifies graduating students (reached end of course)
- Handles semester-based progression (semester 1 → 2, then year 2 semester 1)

### Safety Features
- **Dry Run Mode**: Preview results before executing
- **Rollback Window**: Undo promotions within 24 hours (configurable)
- **Audit Trail**: Complete history of all promotions via promotion_job_events
- **Transaction Safety**: All database operations are atomic
- **RLS Policies**: Row-level security ensures data access control

### Detailed Reporting
Each promotion provides:
- Total students processed
- Number of eligible students
- Number promoted successfully
- Number failed (with reasons)
- Student-level details with from/to progression
- Graduating student identification

## Database Functions

### calculate_next_year_semester
Calculates the next academic level for a student:
```sql
SELECT * FROM calculate_next_year_semester(
  current_year := 1,
  current_semester := 2,
  course_duration_months := 24
);
```

Returns: `next_year`, `next_semester`, `is_graduating`

### can_rollback_promotion
Checks if a promotion job can be rolled back:
```sql
SELECT can_rollback_promotion(job_id);
```

Returns: `boolean` (true if within rollback window)

## Configuration

### Rollback Window
Default: 24 hours
To modify, update the `rollback_window_hours` in promotion_jobs table:
```sql
UPDATE promotion_jobs
SET rollback_window_hours = 48  -- 48 hours
WHERE id = '<job_id>';
```

### Fee Structure Versioning
The fee_structures table now supports versioning:
- `version`: Incremental version number
- `is_published`: Whether fee structure is active
- `published_at`, `published_by`: Publishing audit fields
- `effective_from`, `effective_to`: Date range for fee structure
- `academic_year_id`: Link to academic year

## Security Considerations

### RLS Policies
All tables have Row-Level Security enabled:
- Super admins can access all data
- Admins can access their college's data only
- Students have no access to promotion system

### Edge Function Authentication
All edge functions require JWT authentication:
- `verify_jwt = true` in config.toml
- User must be authenticated and authorized

### Audit Trail
Complete audit trail via:
- `promotion_job_events`: All job-level events
- `student_academic_history`: All student-level changes
- `audit_logs`: System-wide audit trail (existing)

## Testing Checklist

- [ ] Create academic year successfully
- [ ] Set current academic year
- [ ] Run dry run promotion with filters
- [ ] View dry run results
- [ ] Execute promotion successfully
- [ ] Verify student records updated
- [ ] Check academic history records created
- [ ] Test rollback functionality
- [ ] Verify rollback window expiration
- [ ] Test eligibility criteria (attendance)
- [ ] Test eligibility criteria (marks)
- [ ] Test eligibility criteria (fee payment)
- [ ] Verify graduating student detection
- [ ] Test with multiple courses
- [ ] Test semester progression logic
- [ ] Verify RLS policies work correctly

## Future Enhancements

### Potential Improvements
1. **Bulk SMS/Email**: Notify students of promotion
2. **Fee Structure Auto-Assignment**: Automatically assign new fee structures
3. **Certificate Generation**: Auto-generate certificates for graduating students
4. **Performance Optimization**: Batch processing for very large student populations
5. **Scheduled Promotions**: Cron job for automatic promotions at year-end
6. **Custom Criteria**: Allow admins to define custom eligibility rules
7. **Multi-step Approval**: Require approval from multiple stakeholders
8. **Reports Export**: Export promotion reports to PDF/Excel

## Troubleshooting

### Common Issues

**Issue**: Promotion fails with "No students found"
- **Solution**: Check filters are correct and students exist in database

**Issue**: Rollback button not visible
- **Solution**: Check if rollback window has expired (default 24 hours)

**Issue**: Students not eligible despite meeting criteria
- **Solution**: Verify criteria calculation (check attendance/marks data exists)

**Issue**: Edge function timeout
- **Solution**: Consider breaking down large promotions into smaller batches

## Support

For issues or questions:
1. Check console logs in browser dev tools
2. Check edge function logs in Supabase dashboard
3. Review promotion_job_events table for detailed event logs
4. Contact system administrator if problem persists
