# Login Troubleshooting Guide

## Error: "Email Rate Limit Exceeded"

If you see this error, it means **Supabase** (the database system) has temporarily blocked your email address because of too many sign-up attempts in a short time.

### How to Fix It

**Option 1: The Quickest Fix**
*   **Use a different email address.**
*   Try registering with `test@example.com` or any other email. It does not need to be a real valid email for this test application.

**Option 2: Wait**
*   Wait for **1 hour** before trying to use your original email ending in `@vitstudent.ac.in` again.

**Option 3: For Developers (Permanent Fix)**
If you control the Supabase project:
1.  Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to **Authentication** > **Providers** > **Email**.
3.  **Disable** "Confirm Email" (this prevents many rate limit issues).
4.  Go to **Authentication** > **Rate Limits** and increase the limits.

### Proctor Access
*   If you are registering as a Proctor, don't forget the code: `ADMIN2025`.
