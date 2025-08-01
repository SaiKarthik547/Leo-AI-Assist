import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LeoAvatar } from "./LeoAvatar";
import { MessageContent } from "./MessageContent";
import { Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatService } from "@/services/chatService";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import AuthPage from "@/pages/AuthPage";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId?: string;
}

export const ChatInterface = () => {
  // SpeechRecognition setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup effect to stop speech when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        (window as any).speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper to get or create a session for the user
  const getOrCreateSession = async (userId) => {
    try {
      const sessions = await ChatService.getSessions(userId);
      if (sessions && sessions.length > 0) {
        return sessions[0].id; // Use the latest session
      }
      // Otherwise, create a new session
      return await ChatService.createSession(userId);
    } catch (error) {
      console.error("Error getting/creating session:", error);
      // Return temporary session for anonymous users
      return `temp_${Date.now()}`;
    }
  };

  useEffect(() => {
    // Supabase authentication check - allow anonymous users
    const initializeChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          const userData = {
            id: user.id,
            email: user.email,
            username: profile?.full_name || user.email?.split('@')[0]
          };
          
          setUser(userData);
          const sessionId = await getOrCreateSession(user.id);
          setCurrentSessionId(sessionId);
        } else {
          // Anonymous user - create temporary session
          setUser(null);
          const tempSessionId = `temp_${Date.now()}`;
          setCurrentSessionId(tempSessionId);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Failed to initialize chat session");
        setUser(null);
        // Still allow anonymous usage
        const tempSessionId = `temp_${Date.now()}`;
        setCurrentSessionId(tempSessionId);
      } finally {
        setIsLoading(false);
      }
    };
    initializeChat();
  }, []);

  // Load messages from Supabase when session/user changes (only for authenticated users)
  useEffect(() => {
    const loadMessages = async () => {
      if (user && currentSessionId && !currentSessionId.startsWith('temp_')) {
        const supaMessages = await ChatService.getMessages(currentSessionId);
        setMessages(
          supaMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.is_user,
            timestamp: new Date(msg.created_at),
            sessionId: msg.session_id,
          }))
        );
      }
    };
    loadMessages();
  }, [user, currentSessionId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentSessionId || isSending) {
      return;
    }
    
    // Stop any ongoing speech when a new message is sent
    if (voiceEnabled && 'speechSynthesis' in window) {
      if (isSpeaking) {
        (window as any).speechSynthesis.cancel();
        setIsSpeaking(false);
        toast.info('Voice interrupted for new message');
      }
    }
    
    setIsSending(true);
    const userMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      sessionId: currentSessionId
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    try {
      // Save user message to Supabase (only for authenticated users)
      if (user && !currentSessionId.startsWith('temp_')) {
        ChatService.saveMessage(currentSessionId, user.id, currentInput, true).catch(error => {
          console.error("Error saving user message:", error);
        });
      }
      
      // Call Supabase function for AI response
      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { message: currentInput }
      });
      
      if (error) throw error;
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to Supabase (only for authenticated users)
      if (user && !currentSessionId.startsWith('temp_')) {
        ChatService.saveMessage(currentSessionId, user.id, data.response, false).catch(error => {
          console.error("Error saving AI response:", error);
        });
      }
      
      // Robot voice output (only for non-code answers)
      if (voiceEnabled && 'speechSynthesis' in window) {
        const isCode = /```|\b(function|const|let|var|class|def|#include|import|public |private |protected |<\/?[a-z][^>]*>)/i.test(aiResponse.content);
        if (!isCode) {
          // Small delay to ensure previous speech is properly cancelled
          setTimeout(() => {
            setIsSpeaking(true);
            const utter = new (window as any).SpeechSynthesisUtterance(aiResponse.content);
            utter.lang = 'en-US';
            utter.volume = 1;
            utter.rate = 1;
            utter.pitch = 1;
            utter.onend = () => setIsSpeaking(false);
            utter.onerror = (event) => {
              // Only show error if it's not an interruption (which is expected behavior)
              if (event.error !== 'interrupted') {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                toast.error('Voice output error');
              } else {
                // Interruption is expected when new message is sent
                setIsSpeaking(false);
              }
            };
            (window as any).speechSynthesis.speak(utter);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        sessionId: currentSessionId
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error("Failed to get AI response");
    } finally {
      setIsSending(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      // Stop any ongoing speech when logging out
      if ('speechSynthesis' in window) {
        (window as any).speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      await supabase.auth.signOut();
      localStorage.removeItem("currentUser");
      setUser(null);
      setMessages([]);
      // Create new temporary session for anonymous user
      const tempSessionId = `temp_${Date.now()}`;
      setCurrentSessionId(tempSessionId);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full bg-gradient-hero items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-hero items-center justify-center relative">
      {/* 3D background shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl opacity-40 animate-float pointer-events-none z-0" />
             {/* Leo Avatar Header */}
       <div className="flex flex-col items-center justify-center pt-10 pb-4 z-10">
         <div className="flex items-center gap-4 mb-4">
           {user ? (
             <>
               <span className="text-sm text-muted-foreground">
                 Welcome, {user?.username || user?.email}
               </span>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={handleLogout}
                 className="text-xs"
               >
                 Logout
               </Button>
             </>
           ) : (
             <>
               <span className="text-sm text-muted-foreground">
                 Guest Mode - Chat history not saved
               </span>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => window.location.href = '/login'}
                 className="text-xs"
               >
                 Sign In
               </Button>
             </>
           )}
         </div>
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
         {!user && (
           <p className="text-xs text-muted-foreground mt-2 text-center">
             💡 Sign in to save your chat history
           </p>
         )}
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
            onClick={() => {
              if (voiceEnabled && 'speechSynthesis' in window) {
                // Stop any ongoing speech when turning off voice
                (window as any).speechSynthesis.cancel();
                setIsSpeaking(false);
              }
              setVoiceEnabled(!voiceEnabled);
            }}
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
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-input/50 backdrop-blur-sm transition-all duration-300 text-base px-4 py-3"
            disabled={isSending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isSending || !inputValue.trim()}
            className="bg-gradient-primary transition-all duration-300 px-4 py-3"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        

      </div>
    </div>
  );
};