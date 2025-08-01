# Setup Guide - Leo AI Assistant

## Authentication Setup

Your sign-in is now working with Supabase! Here's what you need to do:

### 1. Environment Variables
Make sure your `.env` file contains:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Supabase Database Setup
Your Supabase project should have these tables:

#### `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `chat_sessions` table:
```sql
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `chat_messages` table:
```sql
CREATE TABLE chat_messages (
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

### 3. Row Level Security (RLS)
Enable RLS on all tables and add policies:

#### Profiles RLS:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Chat Sessions RLS:
```sql
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);
```

#### Chat Messages RLS:
```sql
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4. How to Use

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Anonymous Usage**:
   - Anyone can use the chat immediately without signing in
   - Chat messages are not saved to the database
   - Users can still interact with the AI and use all features

3. **Sign in for History**:
   - Click "Sign In" button to create an account or login
   - Enter your full name, email, and password
   - Check your email for confirmation (if email confirmation is enabled)
   - Once signed in, chat history will be automatically saved

4. **Start chatting**:
   - The AI will respond using the free models configured
   - Chat history is only saved for authenticated users
   - Anonymous users can still use all features but history won't persist

### 5. Features Working

✅ **Anonymous Usage**: Anyone can chat without signing in  
✅ **Authentication**: Sign up, sign in, sign out  
✅ **Chat Interface**: Send messages and get AI responses  
✅ **Free Models**: Using OpenRouter with free models  
✅ **Chat History**: Messages saved to Supabase (authenticated users only)  
✅ **Voice Features**: Speech recognition and text-to-speech  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Guest Mode**: Clear indication when not signed in  

### 6. Troubleshooting

**If sign-in doesn't work**:
1. Check your `.env` file has correct Supabase credentials
2. Verify your Supabase project has the required tables
3. Make sure RLS policies are set up correctly
4. Check the browser console for any errors

**If AI responses don't work**:
1. Verify your OpenRouter API key is set
2. Check the Supabase Edge Functions are deployed
3. Ensure the free models are available

### 7. Next Steps

- Deploy your Supabase Edge Functions
- Set up email confirmation (optional)
- Add more features like file uploads
- Customize the UI and branding

The authentication system is now fully functional with Supabase! 🎉 