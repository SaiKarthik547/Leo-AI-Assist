import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Volume2, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [settings, setSettings] = useState({
    voice_enabled: true,
    voice_volume: 75,
    mic_sensitivity: 60,
    language: "en-US",
    auto_response: true,
    notifications: true,
    theme: "dark"
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        let { data, error } = await supabase.from("settings").select("*").eq("user_id", user.id).single();
        if (!data) {
          // Insert default settings for this user
          const { data: inserted, error: insertError } = await supabase.from("settings").insert({
            user_id: user.id,
            voice_enabled: true,
            voice_volume: 75,
            mic_sensitivity: 60,
            language: "en-US",
            auto_response: true,
            notifications: true,
            theme: "dark"
          });
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

  useEffect(() => {
    if (!userId) return;
    const saveSettings = async () => {
      await supabase.from("settings").upsert({
        user_id: userId,
        voice_enabled: settings.voice_enabled,
        voice_volume: settings.voice_volume,
        mic_sensitivity: settings.mic_sensitivity,
        language: settings.language,
        auto_response: settings.auto_response,
        notifications: settings.notifications,
        theme: settings.theme
      });
    };
    saveSettings();
  }, [settings, userId]);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting updated successfully!");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  }
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      <Card className="w-full max-w-4xl mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Settings & Configuration
          </CardTitle>
          <CardDescription>Customize Leo's behavior and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice & Audio Settings */}
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
          {/* Notifications & Privacy */}
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
              <Label htmlFor="auto-response">Auto Response</Label>
              <div className="text-sm text-muted-foreground">
                Enable automatic responses
              </div>
            </div>
            <Switch
              id="auto-response"
              checked={settings.auto_response}
              onCheckedChange={(checked) => updateSetting("auto_response", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme">Theme</Label>
              <div className="text-sm text-muted-foreground">
                Choose your theme
              </div>
            </div>
            <Select value={settings.theme} onValueChange={(value) => updateSetting("theme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
