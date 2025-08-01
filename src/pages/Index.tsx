import { ChatInterface } from "@/components/ChatInterface";
import { SupabaseTest } from "@/components/SupabaseTest";
import { useState } from "react";

const navItems = [
  { label: "Chat", href: "/chat" },
  { label: "Settings", href: "/settings" },
  { label: "Profile", href: "/profile" },
  { label: "History", href: "/history" }
];

const Index = () => {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      {/* Floating three-dot menu (Home page) */}
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
                className={`flex items-center px-5 py-4 text-lg font-semibold hover:bg-muted/20 transition-colors ${item.label === "Chat" ? "bg-primary/20 text-primary" : "text-foreground"}`}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center">
        <div className="mb-4">
          <SupabaseTest />
        </div>
        <ChatInterface />
      </main>
    </div>
  );
};

export default Index;
