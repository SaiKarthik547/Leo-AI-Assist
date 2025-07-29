import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LeoAvatar } from "@/components/LeoAvatar";
import { supabase } from "@/integrations/supabase/client";
import AuthPage from "./AuthPage";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const navItems = [
    { label: "Chat", href: "/chat" },
    { label: "Settings", href: "/settings" },
    { label: "Profile", href: "/profile" },
    { label: "History", href: "/history" }
  ];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!user) {
    return <AuthPage />;
  }
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      {/* 3D background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-secondary/30 to-primary/10 rounded-full blur-2xl opacity-30 animate-float-slow" />
      </div>
      {/* Floating three-dot menu (Profile page only) */}
      <div className="fixed top-6 right-6 z-50">
        <button
          className="w-12 h-12 flex items-center justify-center rounded-full bg-card hover:bg-muted transition"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Open navigation menu"
        >
          <span className="text-3xl">&#8942;</span>
        </button>
        {navOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl animate-fade-in">
            {navItems.map(item => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center px-5 py-4 text-lg font-semibold hover:bg-muted/20 transition-colors ${item.label === "Profile" ? "bg-primary/20 text-primary" : "text-foreground"}`}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col z-10">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            className="px-6 py-2 text-base font-semibold text-primary hover:bg-primary/10"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold bg-gradient-primary bg-clip-text text-transparent mb-3">
            User Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome, {user.email}!
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-1 flex flex-col gap-8 items-center">
            <Card className="w-full bg-card/80 backdrop-blur-sm animate-fade-in">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-6">
                  <Avatar className="w-28 h-28">
                    <AvatarFallback className="text-2xl font-bold bg-gradient-primary text-primary-foreground">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl font-bold">{user.email}</CardTitle>
                <CardDescription className="mt-2 text-base">Supabase Account</CardDescription>
                <Badge className="mx-auto mt-4 bg-secondary text-secondary-foreground text-base px-4 py-2">
                  Connected
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-lg justify-center">
                    <span className="w-5 h-5 text-muted-foreground">👤</span>
                    <span>Signed in with Supabase</span>
                  </div>
                  <Separator />
                  <div className="text-left">
                    <span className="text-base font-semibold">Email</span>
                    <p className="text-base text-muted-foreground mt-2">
                      {user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Leo Connection Status */}
            <Card className="w-full mt-8 bg-gradient-secondary/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-secondary text-xl font-bold">
                  <span>Leo Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <LeoAvatar size="sm" />
                </div>
                <div className="text-center">
                  <Badge className="bg-secondary text-secondary-foreground text-base px-4 py-2">
                    Fully Synchronized
                  </Badge>
                  <p className="text-base text-muted-foreground mt-3">
                    Leo has learned your preferences and communication style
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Preferences & Interests Only */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="w-full bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-xl font-bold">
                  <span>Interests & Preferences</span>
                </CardTitle>
                <CardDescription className="mt-2 text-base">Help Leo understand you better</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 justify-start">
                  {/* No preferences for local users yet */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
