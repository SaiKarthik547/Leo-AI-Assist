import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setInfo("");

    // Basic validation
    if (!email || !password || !fullName) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: fullName 
          } 
        }
      });

      if (error) { 
        console.error('Signup error:', error);
        setError(error.message); 
        return; 
      }

      const userId = data.user?.id;
      if (!userId) { 
        setError("Signup failed: No user id returned."); 
        return; 
      }

      if (!data.session) {
        setInfo("Check your email to confirm your account before logging in.");
        return;
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // Create profile only if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ 
            user_id: userId, 
            full_name: fullName, 
            email 
          });

        if (profileError) { 
          setError(profileError.message); 
          return; 
        }
      }

      navigate("/");
    } catch (error) {
      console.error('Signup catch error:', error);
      setError("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
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
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            {info && <div className="text-green-600 text-sm text-center">{info}</div>}
            <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
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
