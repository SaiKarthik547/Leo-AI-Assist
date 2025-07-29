import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username, // assuming username is email
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-hero px-4 py-8">
      <Card className="w-full max-w-md mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full bg-gradient-primary">Sign In</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <button type="button" className="text-primary underline bg-transparent border-none cursor-pointer" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
