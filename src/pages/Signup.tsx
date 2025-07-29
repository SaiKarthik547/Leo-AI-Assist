import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) { setError(error.message); return; }
    const userId = data.user?.id;
    if (!userId) { setError("Signup failed: No user id returned."); return; }
    if (!data.session) {
      setInfo("Check your email to confirm your account before logging in.");
      return;
    }
    // Wait for session to be available
    let sessionUserId = null;
    for (let i = 0; i < 10; i++) {
      const { data: sessionData } = await supabase.auth.getSession();
      sessionUserId = sessionData.session?.user?.id;
      if (sessionUserId === userId) break;
      await new Promise(res => setTimeout(res, 200));
    }
    if (sessionUserId !== userId) {
      setError("Session not established after signup.");
      return;
    }
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();
    if (!existingProfile) {
      const { error: profileError } = await supabase.from('profiles').insert({ user_id: userId, username, email });
      if (profileError) { setError(profileError.message); return; }
    }
    navigate("/profile");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-hero px-4 py-8">
      <Card className="w-full max-w-md mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSignup}>
            <Input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {info && <div className="text-green-600 text-sm text-center">{info}</div>}
            <Button type="submit" className="w-full bg-gradient-primary">Sign Up</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <button type="button" className="text-primary underline bg-transparent border-none cursor-pointer" onClick={() => navigate('/login')}>Sign in</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
