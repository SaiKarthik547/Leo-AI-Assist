import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  content: string;
  is_user: boolean;
  message_type: string;
  session_id: string;
  user_id: string;
  created_at: string;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Cache for better performance
const sessionCache = new Map<string, ChatSession[]>();
const messageCache = new Map<string, ChatMessage[]>();

export class ChatService {
  static async createSession(userId: string, title: string = "New Chat"): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          title: title
        })
        .select("id")
        .single();

      if (error) throw error;
      
      // Clear cache to ensure fresh data
      sessionCache.delete(userId);
      
      return data.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  static async getSessions(userId: string): Promise<ChatSession[]> {
    // Check cache first
    if (sessionCache.has(userId)) {
      return sessionCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const sessions = data || [];
      
      // Cache the result
      sessionCache.set(userId, sessions);
      
      return sessions;
    } catch (error) {
      console.error("Error getting sessions:", error);
      return [];
    }
  }

  static async getMessages(sessionId: string): Promise<ChatMessage[]> {
    // Check cache first
    if (messageCache.has(sessionId)) {
      return messageCache.get(sessionId)!;
    }

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const messages = data || [];
      
      // Cache the result
      messageCache.set(sessionId, messages);
      
      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }

  static async saveMessage(
    sessionId: string,
    userId: string,
    content: string,
    isUser: boolean,
    messageType: string = "text",
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          user_id: userId,
          content: content,
          is_user: isUser,
          message_type: messageType,
          metadata: metadata || {}
        });

      if (error) throw error;

      // Update session timestamp
      await supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      // Clear caches to ensure fresh data
      messageCache.delete(sessionId);
      sessionCache.delete(userId);
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  static async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({ title: title })
        .eq("id", sessionId);

      if (error) throw error;
      
      // Clear cache
      sessionCache.clear();
    } catch (error) {
      console.error("Error updating session title:", error);
      throw error;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      
      // Clear caches
      messageCache.delete(sessionId);
      sessionCache.clear();
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  // Clear all caches
  static clearCache(): void {
    sessionCache.clear();
    messageCache.clear();
  }
} 