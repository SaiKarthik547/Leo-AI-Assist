# Troubleshooting Guide

## Authentication Issues

### Common Error Codes:

#### 406 Error - "Not Acceptable"
- **Cause**: Querying profiles table with wrong column name
- **Solution**: ✅ Fixed - Updated Login page to use email instead of username

#### 409 Error - "Conflict"
- **Cause**: Trying to insert duplicate profile
- **Solution**: ✅ Fixed - Added check for existing profile before insertion

#### 422 Error - "Unprocessable Entity"
- **Cause**: Invalid signup data (email format, password requirements)
- **Solution**: 
  - Ensure email is valid format
  - Password must be at least 6 characters
  - Check for special characters in name

#### Connection Errors
- **Cause**: Network issues or Supabase service problems
- **Solution**:
  - Check internet connection
  - Verify Supabase project is active
  - Check environment variables are correct

## Database Setup Issues

### Missing Tables
If you get errors about missing tables, run these SQL commands in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user BOOLEAN DEFAULT false,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Issues
Enable RLS and add policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Environment Variables

Make sure your `.env` file has the correct values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-openrouter-api-key
```

## Testing Authentication

1. **Clear browser data**: Clear localStorage and cookies
2. **Test signup**: Try creating a new account
3. **Test login**: Try signing in with existing account
4. **Check console**: Look for any JavaScript errors

## Anonymous Usage

If authentication fails, the app will still work in anonymous mode:
- Users can chat without signing in
- Chat history won't be saved
- All AI features work normally

## Getting Help

1. Check the browser console for detailed error messages
2. Verify your Supabase project settings
3. Ensure all environment variables are set correctly
4. Test with a fresh browser session 