import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LeoAvatar } from "./LeoAvatar";
import { MessageContent } from "./MessageContent";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatInterface = () => {
  // SpeechRecognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        toast('Voice input captured');
      };
      recognitionRef.current.onerror = (event: any) => {
        toast.error('Voice recognition error: ' + event.error);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      } catch {
        // fallback to default
      }
    }
    return [{
      id: "1",
      content: "Hello! I'm your assistant. I'm here to help you with anything you need. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }];
  });
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Save chat history to localStorage (per user)
    // Get current user from localStorage
    const localUser = localStorage.getItem("currentUser");
    if (localUser) {
      const u = JSON.parse(localUser);
      if (u && u.username) {
        localStorage.setItem(`chatHistory_${u.username}`, JSON.stringify(messages));
      }
    }
  }, [messages]);

  useEffect(() => {
    // Get current user for filtering
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Load chat history for this user only
    if (user) {
      const saved = localStorage.getItem(`chatHistory_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
        } catch {}
      } else {
        setMessages([{
          id: "1",
          content: "Hello! I'm your assistant. I'm here to help you with anything you need. How can I assist you today?",
          isUser: false,
          timestamp: new Date()
        }]);
      }
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { message: currentInput }
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);

      // Robot voice output
      if (voiceEnabled && 'speechSynthesis' in window) {
        setIsSpeaking(true);
        const utter = new window.SpeechSynthesisUtterance(aiResponse.content);
        utter.lang = 'en-US';
        utter.volume = 1;
        utter.rate = 1;
        utter.pitch = 1;
        utter.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error("Failed to get AI response");
    }
  };

  const toggleVoiceListening = () => {
    if (!SpeechRecognition) {
      toast.error('SpeechRecognition API not supported in this browser.');
      return;
    }
    if (!isListening) {
      setIsListening(true);
      toast('Voice listening activated');
      recognitionRef.current.start();
    } else {
      setIsListening(false);
      recognitionRef.current.stop();
      toast('Voice listening stopped');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-hero items-center justify-center relative">
      {/* 3D background shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl opacity-40 animate-float pointer-events-none z-0" />
      {/* Leo Avatar Header */}
      <div className="flex flex-col items-center justify-center pt-10 pb-4 z-10">
        <LeoAvatar 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
          size="md" 
        />
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-4">
          Assistant
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          Your intelligent companion
        </p>
      </div>
      {/* Chat Messages */}
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col z-10">
        <ScrollArea className="flex-1 h-[60vh] md:h-[70vh] p-4" ref={scrollAreaRef}>
          <ScrollAreaPrimitive.Viewport ref={viewportRef} className="h-full w-full rounded-[inherit]">
            <div className="space-y-6 pb-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`
                      max-w-[85%] p-4 rounded-2xl shadow-lg
                      ${message.isUser 
                        ? "bg-gradient-primary text-primary-foreground" 
                        : "bg-card/80 text-card-foreground"
                      }
                    `}
                  >
                    <MessageContent content={message.content} isUser={message.isUser} />
                    <span className="text-xs opacity-70 mt-2 block text-right">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollAreaPrimitive.Viewport>
        </ScrollArea>
      </div>
      {/* Input Area */}
      <div className="w-full max-w-4xl mx-auto p-4 bg-card/50 z-20 sticky bottom-0 md:static">
        {/* Voice and Audio Controls */}
        <div className="flex justify-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVoiceListening}
            className={`
              ${isListening ? "bg-secondary text-secondary-foreground" : ""}
              transition-all duration-300"
            `}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            Voice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`
              ${voiceEnabled ? "bg-secondary text-secondary-foreground" : ""}
              transition-all duration-300"
            `}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Audio
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex space-x-3 items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 bg-input/50 backdrop-blur-sm transition-all duration-300 text-base px-4 py-3"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-primary transition-all duration-300 px-4 py-3"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};