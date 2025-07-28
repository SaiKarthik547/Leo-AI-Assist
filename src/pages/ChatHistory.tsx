import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageContent } from "@/components/MessageContent";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language?: string;
}

interface DailyHistory {
  date: string;
  messages: Message[];
}

function groupMessagesByDay(messages: Message[]): DailyHistory[] {
  const grouped: { [date: string]: Message[] } = {};
  messages.forEach(msg => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(msg);
  });
  return Object.entries(grouped).map(([date, messages]) => ({ date, messages }));
}

export default function ChatHistory() {
  const [history, setHistory] = useState<DailyHistory[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const localUser = localStorage.getItem("currentUser");
    if (!localUser) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(localUser);
    const saved = localStorage.getItem(`chatHistory_${user.username}`);
    if (saved) {
      try {
        const parsed: Message[] = JSON.parse(saved).map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
        setHistory(groupMessagesByDay(parsed));
      } catch {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      {/* 3D background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-secondary/30 to-primary/10 rounded-full blur-2xl opacity-30 animate-float-slow" />
      </div>
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col z-10">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center md:text-left">Chat History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div>No chat history found.</div>
            ) : (
              history.map(day => (
                <div key={day.date} className="mb-8">
                  <h2 className="text-lg font-bold mb-2">{day.date}</h2>
                  <div className="space-y-2">
                    {day.messages.map(msg => (
                      <div key={msg.id} className={`p-3 rounded-lg ${msg.isUser ? "bg-gradient-primary text-primary-foreground" : "bg-card/80 text-card-foreground"}`}>
                        <span className="block text-xs opacity-70 mb-1">{msg.timestamp.toLocaleTimeString()}</span>
                        <MessageContent content={msg.content} isUser={msg.isUser} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
