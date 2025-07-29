import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Volume2, 
  Mic, 
  Palette, 
  Shield, 
  Bell, 
  Globe,
  Database,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { useEffect } from "react";
export default function Settings() {
  const [settings, setSettings] = useState({
    voice_enabled: true,
    voice_volume: 75,
    mic_sensitivity: 60,
    language: "en-US",
    auto_response: true,
    notifications: true,
    theme: "dark",
    data_collection: false,
    auto_save: true,
    response_speed: "fast"
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const saveSettings = async () => {
      await supabase.from("settings").upsert({ user_id: userId, ...settings });
    };
    saveSettings();
  }, [settings, userId]);
  useEffect(() => {
    const fetchUserAndSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        let { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).single();
        if (!data) {
          // Insert default settings for this user
          const { data: inserted, error: insertError } = await supabase.from("settings").insert({ user_id: user.id });
          if (!insertError) {
            data = inserted ? (Array.isArray(inserted) ? inserted[0] : inserted) : null;
          }
        }
        if (data) setSettings(data);
      }
      setLoading(false);
    };
    fetchUserAndSettings();
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting updated successfully!");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  }
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
            Settings & Configuration
          </h1>
          <p className="text-muted-foreground">
            Customize Leo's behavior and preferences
          </p>
        </div>
        <div className="space-y-6">
          {/* Voice & Audio Settings */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-secondary" />
                <span>Voice & Audio</span>
              </CardTitle>
              <CardDescription>Configure voice recognition and audio output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-enabled">Voice Recognition</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable voice commands and responses
                  </div>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={settings.voice_enabled}
                  onCheckedChange={(checked) => updateSetting("voice_enabled", checked)}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Voice Volume: {settings.voice_volume}%</Label>
                <Slider
                  value={[settings.voice_volume]}
                  onValueChange={(value) => updateSetting("voice_volume", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-3">
                <Label>Microphone Sensitivity: {settings.mic_sensitivity}%</Label>
                <Slider
                  value={[settings.mic_sensitivity]}
                  onValueChange={(value) => updateSetting("mic_sensitivity", value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="zh-CN">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {/* Notifications & Privacy */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-leo-amber" />
                <span>Notifications & Privacy</span>
              </CardTitle>
              <CardDescription>Manage notifications and data privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">System Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive system alerts and updates
                  </div>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting("notifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-collection">Data Collection</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow anonymous usage data collection
                  </div>
                </div>
                <Switch
                  id="data-collection"
                  checked={settings.data_collection}
                  onCheckedChange={(checked) => updateSetting("data_collection", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Auto Save Conversations</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically save chat history
                  </div>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.auto_save}
                  onCheckedChange={(checked) => updateSetting("auto_save", checked)}
                />
              </div>
            </CardContent>
          </Card>
          {/* Database & Storage UI remains for reference, but not functional */}
        </div>
      </main>
    </div>
  );
}
