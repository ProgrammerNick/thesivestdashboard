# Sign-Up Troubleshooting Guide

## Issue: Sign-up isn't registering users or redirecting

## Steps to Fix

### Step 1: Verify Database Migrations

Run these commands in order:

```bash
# Start SST in one terminal
npx sst dev

# In a SECOND terminal, run migration
pnpm db:push
```

Look for:
- ✓ Success message
- No errors
- Applied 0 migrations (if first time)

### Step 2: Check Auth Configuration

Verify `src/lib/auth.ts` has correct configuration:

✅ Should have:
- `account.accountLinking.enabled: true` - For OAuth (Google/GitHub)
- Proper hook syntax for avatar generation
- Correct database connection

❌ Should NOT have:
- Typos in property names
- Missing imports (eq from drizzle-orm)

### Step 3: Test Sign-Up Form

Open browser DevTools (F12) and try signing up:

#### Expected Console Output:
```
Sign up successful!
```

#### If Error Appears:
Look for error messages:
- "column 'username' does not exist" → Database not migrated
- "Failed to create account" → Auth hook error
- Network errors → Connection issues
- 422/500 errors → Validation or server error

### Step 4: Check Better Auth Client

Verify `src/lib/auth-client.ts`:

```typescript
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL
})
```

**Important:** `VITE_SERVER_URL` must be set in `.env.local` or through SST

### Step 5: Verify Environment Variables

Check that `.env.local` exists and has:

```env
DATABASE_URL=postgresql://...
VITE_SERVER_URL=http://localhost:3000
```

### Step 6: Test Direct Database Query

Create a test file `test-db.ts`:

```typescript
import { getClient } from "./db";

async function testDB() {
  try {
    const client = await getClient();
    console.log("✅ Database connected");

    // Test if username column exists
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'user'
    `);

    console.log("User table columns:", result);
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

testDB();
```

## Common Issues & Solutions

### Issue: "column 'username' does not exist"
**Cause:** Database schema not updated

**Solution:**
1. Run `npx sst dev`
2. Run `pnpm db:push`
3. Verify migration completed
4. Restart dev server

### Issue: Form submits but nothing happens
**Cause:** JavaScript error or auth client issue

**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check if `authClient` is properly configured

### Issue: "Redirect not working"
**Cause:** Using `window.location.href` instead of router

**Solution:**
Use `useNavigate` or router's `navigate` method

### Issue: Auth hook throws error
**Cause:** Database adapter issue or missing imports

**Solution:**
1. Verify `src/db/schema.ts` exports all tables
2. Check `src/lib/auth.ts` has correct imports
3. Check database connection string

## Quick Fix Checklist

- [ ] SST is running (`npx sst dev`)
- [ ] Database migration completed (`pnpm db:push`)
- [ ] No console errors in browser
- [ ] No network errors (422, 500, etc.)
- [ ] Success message appears in console
- [ ] User is redirected to home
- [ ] Header shows logged-in user
- [ ] Avatar is displayed

## Debug Mode

To enable Better Auth debug logging, add to `src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  // ... existing config
  advanced: {
    useSecureCookies: import.meta.env.PROD === "production",
  },
  logger: {
    level: "debug", // or "trace" for more details
  },
});
```

## Still Not Working?

If you've tried everything and it's still not working:

1. **Check the browser:**
   - Try Chrome instead of Firefox/Edge
   - Disable extensions
   - Try Incognito/Private window

2. **Check the terminal:**
   - Look for database connection errors
   - Look for migration errors
   - Check if SST is actually running

3. **Try simpler approach:**
   - Comment out the avatar generation hook
   - Remove the `account.accountLinking` config
   - Test basic email/password auth first

4. **Reset everything:**
   ```bash
   # Stop SST
   Ctrl+C in the SST terminal

   # Clear node_modules and reinstall
   rm -rf node_modules
   pnpm install

   # Start fresh
   npx sst dev
   pnpm dev
   ```

## Getting Help

Share these details when asking for help:

1. **What error message do you see?** (exact text)
2. **What's in the browser console?** (F12 → Console tab)
3. **What's in the terminal?** (error logs)
4. **What happens when you click "Sign Up"?** (nothing, loading, error, etc.)
5. **What browser are you using?** (Chrome, Firefox, Safari, etc.)

