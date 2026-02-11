

# Admin Dashboard Improvements

## Current Issues Found

1. **Duplicate Welcome Header**: Both `Dashboard.tsx` and `AdminDashboard.tsx` render their own welcome/header section, so admins see two gradient headers stacked.

2. **Fake/Estimated Data in Widgets**:
   - **UserActivityWidget** shows "Active Today" and "This Week" as hardcoded percentages (30% and 70% of total users) -- not real data.
   - **AcademicOverviewWidget** uses `Math.random()` for per-course attendance and estimates pass rate with a formula rather than real exam results.

3. **Duplicate Data Fetching**: `Dashboard.tsx` fetches student/course/faculty/fee counts, then `AdminDashboard.tsx` fetches the exact same data again independently. A `get_dashboard_stats` RPC function already exists but is not being used.

4. **Navigation Using `window.location.href`**: The Pending Actions section uses `window.location.href` for navigation instead of React Router's `useNavigate`, causing full page reloads.

5. **Cramped 4-Column Widget Layout**: All 4 feature widgets are in a single `lg:grid-cols-4` row, making each widget very narrow and hard to read on most screens.

---

## Proposed Changes

### 1. Remove Duplicate Welcome Header
Remove the welcome header from `AdminDashboard.tsx` since `Dashboard.tsx` already renders one. This eliminates the double-header for admins.

### 2. Replace Fake Data with Real Metrics
- **UserActivityWidget**: Remove the fake 30%/70% estimates. Show only verifiable data -- total users and recent user registrations. Add a note that login tracking requires an audit log table.
- **AcademicOverviewWidget**: Remove `Math.random()` attendance values. Calculate real per-course attendance from `attendance_records`. Remove the fake pass rate or label it clearly as "estimated."

### 3. Use the Existing RPC Function
Replace the duplicate stat-fetching in `AdminDashboard.tsx` with a call to the `get_dashboard_stats` RPC that already exists, reducing database queries from 8+ individual calls to 1.

### 4. Fix Navigation
Replace `window.location.href` with `useNavigate()` from React Router in the `handleActionClick` function.

### 5. Improve Widget Layout
Change the widget grid from `lg:grid-cols-4` to `md:grid-cols-2` so widgets get more horizontal space and are easier to read. Two widgets per row is more comfortable.

### 6. Remove Duplicate Stats Rows
The AdminDashboard renders two full rows of StatsCards (8 total) plus Dashboard.tsx renders its own row (4 more). Remove the stats from AdminDashboard since the parent Dashboard already shows them, or consolidate into one combined set.

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/AdminDashboard.tsx` | Remove welcome header, remove duplicate stats grid, use RPC, fix `window.location.href` to `useNavigate`, change widget grid to `md:grid-cols-2` |
| `src/components/dashboard/admin/UserActivityWidget.tsx` | Remove fake percentage estimates, show only real data |
| `src/components/dashboard/admin/AcademicOverviewWidget.tsx` | Remove `Math.random()`, compute real per-course attendance, label estimated pass rate |

### No new dependencies required.

