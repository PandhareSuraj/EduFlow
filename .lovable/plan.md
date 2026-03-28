

# Senior Product Review: Hostel, Transport & Placement Modules

## Summary of Findings

After thorough code review of all three modules against their database schemas, I identified **15 bugs and issues** across the three modules. The problems range from data integrity failures to hardcoded dummy data misleading users, and missing required fields that will cause insert failures.

---

## Module 1: HOSTEL

### Bug H1: Hardcoded stats cards show fake data
**Severity: Medium** | File: `src/pages/Hostel.tsx` lines 165-193

The "Occupied Rooms" card shows hardcoded `95` instead of `stats?.occupiedRooms`. "Pending Complaints" shows hardcoded `8`. "Monthly Revenue" shows hardcoded `₹4,75,000`. The overview tab also has hardcoded building data (Building A: 32 occupied, etc.) instead of querying real data.

**Fix:** Replace hardcoded values with `stats?.occupiedRooms`, `stats?.pendingComplaints`, and query actual room data grouped by building for the overview card.

### Bug H2: Allocation dialog doesn't filter students by college
**Severity: Medium** | File: `src/components/forms/AddHostelAllocationDialog.tsx` line 67-74

The student query fetches ALL active students across all colleges (no `college_id` filter). Same for rooms query (line 78-88) -- no college filter.

**Fix:** Add `.eq("college_id", college.id)` to both student and room queries. Pass `college` context or add `enabled: !!college?.id`.

### Bug H3: Allocations and Complaints tabs are placeholders
**Severity: Low** | File: `src/pages/Hostel.tsx` lines 269-303

The Allocations, Mess, and Complaints tabs show placeholder text. Data exists in `hostel_allocations` and `hostel_complaints` tables but is not rendered.

**Fix:** Build out the Allocations tab to list current allocations (student, room, fee, status) with a table. Build out the Complaints tab similarly.

### Bug H4: Overview tab has hardcoded complaints data
**Severity: Low** | File: `src/pages/Hostel.tsx` lines 237-259

"Recent Complaints" card shows hardcoded entries (Room A-101, B-205) instead of querying `hostel_complaints`.

**Fix:** Query `hostel_complaints` table ordered by `created_at` DESC limit 5 and render real data.

---

## Module 2: TRANSPORT

### Bug T1: Route table references `route.fare` but DB column is `base_fare`
**Severity: High** | File: `src/pages/Transport.tsx` line 58

The table renders `₹{route.fare}` but the database column is `base_fare`. This will display `₹undefined` for every route.

**Fix:** Change `route.fare` to `route.base_fare`.

### Bug T2: No college_id filter on routes query
**Severity: Medium** | File: `src/pages/Transport.tsx` lines 13-24

`RoutesManagement` fetches all transport routes across all colleges without filtering by `college_id`. Same for stats queries (lines 78-96).

**Fix:** Use `useCollege()` context, add `.eq("college_id", college.id)` to routes and stats queries.

### Bug T3: All stats cards except Active Routes/Buses show hardcoded data
**Severity: Medium** | File: `src/pages/Transport.tsx` lines 146-168

"Daily Passengers" shows hardcoded `650`. "On-Time Performance" shows hardcoded `94%`. "Covering 45 stops" and "2 in maintenance" are also hardcoded.

**Fix:** Either query real data or show "N/A" / "Coming soon" instead of misleading numbers.

### Bug T4: All sub-tabs are placeholders
**Severity: Low** | File: `src/pages/Transport.tsx` lines 263-309

Buses, GPS Tracking, Attendance, and Subscriptions tabs all show placeholder text. The overview tab also has hardcoded route status and bus tracking data.

**Fix:** Build out at minimum the Bus Fleet tab using the `buses` table data.

### Bug T5: Overview tab has hardcoded route/bus data
**Severity: Low** | File: `src/pages/Transport.tsx` lines 182-256

"Route Status" and "Live Bus Tracking" cards show fabricated data (KA-01-AB-1234, etc.) instead of querying `buses` and `transport_routes`.

**Fix:** Query real data from `buses` joined with `transport_routes`.

---

## Module 3: PLACEMENTS

### Bug P1: Interview insert is missing required `company_id` field
**Severity: Critical** | File: `src/components/placements/InterviewSchedulingDialog.tsx` line 76-87

The `interviews` table requires `company_id` (NOT NULL in schema). The insert only sends `job_posting_id`, `student_id`, etc. -- no `company_id`. This will fail with a DB constraint error every time.

**Fix:** Either look up the company_id from the selected job_posting, or add a company_id field to the form. Best approach: fetch it from `job_postings.company_id` based on the selected `job_id`.

### Bug P2: Placement insert is missing required `company_id` field
**Severity: Critical** | File: `src/components/placements/PlacementConfirmationDialog.tsx` line 78-87

`student_placements` requires `company_id` (NOT NULL). The insert only provides `job_posting_id` but not `company_id`. Insert will fail.

**Fix:** Look up `company_id` from the selected job posting and include it in the insert.

### Bug P3: Placement Drive insert is missing `drive_name` column in DB
**Severity: High** | File: `src/components/placements/PlacementDriveDialog.tsx` line 76-87

The insert sends `drive_name` but the `placement_drives` table schema has no `drive_name` column (not in the types). This will likely be silently ignored or fail.

**Fix:** Check if the column exists. If not, add it via migration, or map to an existing field.

### Bug P4: Placement Drive list renders `drive.drive_name` which doesn't exist in schema
**Severity: High** | File: `src/components/placements/PlacementDrivesList.tsx` line 51

Renders `drive.drive_name` but this column doesn't exist in the `placement_drives` schema. Will show `undefined`.

**Fix:** Same as P3 -- either add the column or use an existing field.

### Bug P5: Job posting uses `job_title` in display but DB column is `title`
**Severity: Medium** | File: `src/pages/Placements.tsx` line 606

Jobs tab renders `(job as any).job_title` but the DB column is `title`. Will show `undefined`.

**Fix:** Change to `job.title`.

### Bug P6: Placement Rate shows hardcoded 85%
**Severity: Low** | File: `src/pages/Placements.tsx` line 539

The "Placement Rate" stat card shows hardcoded `85%` instead of using the calculated rate from the Dashboard query.

**Fix:** Use calculated placement rate from stats or compute inline.

---

## Implementation Priority

1. **Critical (will crash/fail on use):** P1, P2 -- missing required `company_id` on interview and placement inserts
2. **High (broken display):** T1 (`route.fare` undefined), P3/P4 (`drive_name` column missing), P5 (`job_title` undefined)
3. **Medium (data leakage/misleading):** H1/H2, T2/T3 -- hardcoded fake stats, missing college filters
4. **Low (incomplete features):** H3/H4, T4/T5 -- placeholder tabs, hardcoded overview data

### Files to modify:
- `src/pages/Hostel.tsx` -- replace hardcoded stats, add college filter
- `src/components/forms/AddHostelAllocationDialog.tsx` -- add college_id filters
- `src/pages/Transport.tsx` -- fix `route.fare` to `route.base_fare`, add college filters, fix hardcoded stats
- `src/pages/Placements.tsx` -- fix `job_title` to `title`, fix hardcoded placement rate
- `src/components/placements/InterviewSchedulingDialog.tsx` -- add `company_id` lookup
- `src/components/placements/PlacementConfirmationDialog.tsx` -- add `company_id` lookup
- `src/components/placements/PlacementDriveDialog.tsx` -- fix `drive_name` column
- `src/components/placements/PlacementDrivesList.tsx` -- fix `drive_name` reference
- **Database migration**: add `drive_name` column to `placement_drives` if missing

