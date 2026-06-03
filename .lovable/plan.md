# Fix: "Failed to create college" error

## What's happening
The college code **006677** already belongs to "NITYA COLLEGE OF ENGINEERING". The `colleges.code` column is unique, so saving a second college with the same code is rejected by the database (HTTP 409). Right now the app only shows a generic "Failed to create college" message, so it's not clear *why* it failed.

## The fix
In `src/pages/CollegeManagement.tsx` (the `handleSubmit` function):

1. **Detect the duplicate-code error** — when Supabase returns the unique-violation error (Postgres code `23505` / HTTP 409), show a specific, friendly toast: e.g. *"A college with code 006677 already exists. Please use a different code."* instead of the generic message.

2. **Trim & normalize inputs** before insert (trim name/code/etc.) so stray spaces don't cause silent mismatches.

3. **Optional pre-check** — before inserting, query `colleges` for the entered code and, if found, block submission with the same friendly message (avoids the network round-trip failure).

## Notes
- This is a UI/validation change only; no database schema change is needed (the unique constraint is correct and should stay).
- The `placeholder-user.jpg` 404 and the `toLowerCase` console error are unrelated cosmetic/log noise from elsewhere; if you'd like, I can investigate those separately, but they are not the cause of the college-creation failure.

The actual remedy for the user right now: enter a **unique college code** (006677 is taken).