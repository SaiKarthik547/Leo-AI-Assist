import { supabase } from "@/integrations/supabase/client";

export interface Command {
  id: string;
  command: string;
  description: string | null;
  executed_at: string;
  status: string;
  result: string | null;
  user_id: string;
}

export class CommandService {
  static async logCommand(
    userId: string,
    command: string,
    description?: string,
    result?: string,
    status: string = "executed"
  ): Promise<void> {
    const { error } = await supabase
      .from("commands")
      .insert({
        user_id: userId,
        command: command,
        description: description,
        result: result,
        status: status
      });

    if (error) throw error;
  }

  static async getCommandHistory(userId: string): Promise<Command[]> {
    const { data, error } = await supabase
      .from("commands")
      .select("*")
      .eq("user_id", userId)
      .order("executed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async updateCommandStatus(
    commandId: string,
    status: string,
    result?: string
  ): Promise<void> {
    const { error } = await supabase
      .from("commands")
      .update({
        status: status,
        result: result
      })
      .eq("id", commandId);

    if (error) throw error;
  }
} 