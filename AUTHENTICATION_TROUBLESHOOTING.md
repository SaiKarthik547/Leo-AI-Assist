# Authentication Troubleshooting Guide

## Common Error Codes and Solutions

### 422 Error - "Unprocessable Entity" (Signup)
**Cause**: Invalid signup data or Supabase configuration issues

**Solutions**:
1. **Check Environment Variables**:
   - Ensure `.env` file exists in project root
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Check that values are correct (no extra spaces)

2. **Password Requirements**:
   - Password must be at least 6 characters
   - Avoid special characters that might cause issues

3. **Email Validation**:
   - Use a valid email format (e.g., `test@example.com`)
   - Avoid disposable email addresses

4. **Supabase Project Settings**:
   - Check if email confirmation is required
   - Verify project is active and not paused

### 400 Error - "Bad Request" (Login)
**Cause**: Invalid login credentials or authentication issues

**Solutions**:
1. **Check Credentials**:
   - Ensure email and password are correct
   - Check for typos in email address

2. **Account Status**:
   - Verify account was created successfully
   - Check if email confirmation is required

3. **Supabase Configuration**:
   - Verify project URL and API key are correct
   - Check if authentication is enabled in Supabase

## Testing Steps

### 1. Environment Variables Test
The app now includes a Supabase connection test on the main page. Check if it shows:
- ✅ URL: Loaded
- ✅ Key: Loaded
- Status: Connected

### 2. Manual Testing
1. **Clear Browser Data**: Clear localStorage and cookies
2. **Test Signup**: Try creating a new account with:
   - Valid email (e.g., `test@example.com`)
   - Password at least 6 characters
   - Full name
3. **Test Login**: Try signing in with the created account

### 3. Console Debugging
Check browser console for detailed error messages:
- Look for specific error codes
- Check network tab for failed requests
- Verify environment variables are loaded

## Common Issues and Fixes

### Issue: "Environment variables not loaded"
**Fix**: Create or update `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Issue: "Connection error"
**Fix**: 
1. Verify Supabase project is active
2. Check URL and API key are correct
3. Ensure project is not paused

### Issue: "Invalid email format"
**Fix**: Use proper email format (e.g., `user@domain.com`)

### Issue: "Password too short"
**Fix**: Use password with at least 6 characters

## Supabase Project Setup

### Required Tables
Ensure these tables exist in your Supabase project:

```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (optional)
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_enabled BOOLEAN DEFAULT true,
  voice_volume INTEGER DEFAULT 75,
  mic_sensitivity INTEGER DEFAULT 60,
  language TEXT DEFAULT 'en-US',
  auto_response BOOLEAN DEFAULT true,
  notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
Enable RLS and add policies:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Getting Help

1. **Check the Supabase Test Component**: Look at the test component on the main page
2. **Browser Console**: Check for detailed error messages
3. **Network Tab**: Look for failed requests and their status codes
4. **Supabase Dashboard**: Verify project settings and logs

## Anonymous Mode

If authentication continues to fail, the app will work in anonymous mode:
- Users can chat without signing in
- Chat history won't be saved
- All AI features work normally
- Voice functionality works without authentication 