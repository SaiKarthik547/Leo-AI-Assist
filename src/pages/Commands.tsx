import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Power, 
  RotateCcw, 
  Lock, 
  FolderOpen, 
  Wifi, 
  Volume2,
  Search,
  Calendar,
  Mail
} from "lucide-react";
import { toast } from "sonner";

const systemCommands = [
  {
    category: "System Control",
    commands: [
      { name: "Shutdown", icon: Power, command: "shutdown", color: "destructive" },
      { name: "Restart", icon: RotateCcw, command: "restart", color: "warning" },
      { name: "Lock Screen", icon: Lock, command: "lock", color: "secondary" },
    ]
  },
  {
    category: "Applications",
    commands: [
      { name: "File Explorer", icon: FolderOpen, command: "explorer", color: "primary" },
      { name: "Network Settings", icon: Wifi, command: "network", color: "primary" },
      { name: "Sound Settings", icon: Volume2, command: "sound", color: "primary" },
    ]
  },
  {
    category: "Quick Actions",
    commands: [
      { name: "Web Search", icon: Search, command: "search", color: "accent" },
      { name: "Calendar", icon: Calendar, command: "calendar", color: "accent" },
      { name: "Email", icon: Mail, command: "email", color: "accent" },
    ]
  }
];

export default function Commands() {
  const [executingCommand, setExecutingCommand] = useState<string | null>(null);

  // Show shortcut message instead of executing
  const executeCommand = (command: string, name: string) => {
    setExecutingCommand(command);
    let shortcutMsg = "";
    switch (command) {
      case "task manager":
        shortcutMsg = "Shortcut: Ctrl + Shift + Esc";
        break;
      case "settings":
        shortcutMsg = "Shortcut: Windows + I";
        break;
      case "lock screen":
        shortcutMsg = "Shortcut: Windows + L";
        break;
      case "file explorer":
        shortcutMsg = "Shortcut: Windows + E";
        break;
      case "shutdown":
        shortcutMsg = "Shortcut: Alt + F4 (on desktop)";
        break;
      case "restart":
        shortcutMsg = "Shortcut: Alt + F4 (on desktop), then select Restart";
        break;
      default:
        shortcutMsg = "No shortcut available for this command.";
    }
    toast.info(`${name}: ${shortcutMsg}`);
    setExecutingCommand(null);
    // Log command to localStorage
    const history = JSON.parse(localStorage.getItem("commandHistory") || "[]");
    history.push({ command, name, shortcut: shortcutMsg, timestamp: new Date().toISOString() });
    localStorage.setItem("commandHistory", JSON.stringify(history));
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      {/* 3D background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-secondary/30 to-primary/10 rounded-full blur-2xl opacity-30 animate-float-slow" />
      </div>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col z-10">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            System Commands
          </h1>
          <p className="text-muted-foreground">
            Control your system with Leo's intelligent commands
          </p>
        </div>

        {/* Command Categories */}
        <div className="space-y-8">
          {systemCommands.map((category) => (
            <Card key={category.category} className="bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  {category.category}
                </CardTitle>
                <CardDescription>
                  Available commands for {category.category.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.commands.map((cmd) => {
                    const Icon = cmd.icon;
                    const isExecuting = executingCommand === cmd.command;
                    
                    return (
                      <Button
                        key={cmd.command}
                        variant="outline"
                        className={`
                          h-20 flex flex-col space-y-2 p-4 
                          bg-gradient-glass backdrop-blur-sm border-border/50
                          hover:shadow-glow transition-all duration-300
                          ${isExecuting ? "animate-pulse-glow" : ""}
                        `}
                        onClick={() => executeCommand(cmd.command, cmd.name)}
                        disabled={isExecuting}
                      >
                        <Icon className={`w-6 h-6 ${isExecuting ? "animate-rotate-slow" : ""}`} />
                        <span className="text-sm font-medium">{cmd.name}</span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-secondary/20 text-secondary-foreground"
                        >
                          {cmd.command}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voice Commands Info */}
        <Card className="mt-8 bg-gradient-secondary/10 backdrop-blur-sm border-secondary/30">
          <CardHeader>
            <CardTitle className="text-secondary">Voice Commands</CardTitle>
            <CardDescription>
              You can also use voice commands by saying "Hey Leo" followed by:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>"Shutdown the computer"</div>
              <div>"Restart my system"</div>
              <div>"Lock my screen"</div>
              <div>"Open file explorer"</div>
              <div>"Search for [query]"</div>
              <div>"What's the time?"</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}