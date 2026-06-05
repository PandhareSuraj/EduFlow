I found the failing flow: `create-general-user` is returning `400 Bad Request`, but the UI always replaces the real backend message with a generic `Failed to create user`. The edge function also validates passwords more strictly than the form explains, so a manually entered password can trigger a hidden validation failure.

Plan:

1. Improve the Create User form validation
   - Validate email, role, college, and password before calling the edge function.
   - If a password is entered, show the exact requirements: at least 8 characters, one uppercase letter, one lowercase letter, and one number.
   - Disable duplicate submissions while the request is running.

2. Show the real backend error in the UI
   - Update `src/pages/UserManagement.tsx` so the toast displays the edge function response message/details instead of always saying `Failed to create user`.
   - If the backend says “User already exists”, “Validation failed”, or another specific issue, show that directly.

3. Harden `create-general-user`
   - Normalize validated values before use: lowercase/trim email and role, convert empty college to `null`.
   - Add clear validation logging and response messages.
   - Add environment-secret checks for `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` without logging secret values.
   - Add the same super-admin caller verification pattern already used in `list-all-users`, so only super admins can create accounts.

4. Verify the fix
   - Deploy/test the updated edge function.
   - Confirm invalid passwords show a helpful message and valid user creation no longer returns a hidden generic error.

Technical note:
The screenshot’s `FunctionsHttpError: Edge Function returned a non-2xx status code` is a wrapper error from `supabase.functions.invoke`; the underlying `400` response is likely being produced by validation before the function reaches the auth-user creation step.