import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Thermometer, 
  Wifi, 
  Battery,
  Activity,
  Server
} from "lucide-react";

interface SystemStat {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: "good" | "warning" | "critical";
  icon: React.ComponentType<{ className?: string }>;
}

export default function System() {
  const [systemStats, setSystemStats] = useState<SystemStat[]>([]);
  const [networkInfo, setNetworkInfo] = useState({});

  // Simulate real-time updates
  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/system-info");
        const info = res.data;
        setSystemStats([
          { label: "CPU Usage", value: info.cpuUsage * 100, max: 100, unit: "%", status: "good", icon: Cpu },
          { label: "Memory Usage", value: ((info.totalMem - info.freeMem) / info.totalMem) * 100, max: 100, unit: "%", status: "good", icon: MemoryStick },
        ]);
        setNetworkInfo({
          platform: info.platform,
          arch: info.arch,
          uptime: info.uptime,
          hostname: info.hostname,
          user: info.userInfo.username
        });
      } catch (err) {
        // fallback or error
      }
    };
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-secondary";
      case "warning": return "text-leo-amber";
      case "critical": return "text-destructive";
      default: return "text-foreground";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "good": return "text-secondary";
      case "warning": return "text-leo-amber";
      case "critical": return "text-destructive";
      default: return "text-primary";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-hero px-4 py-8 overflow-y-auto h-screen relative">
      {/* 3D background shapes */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-secondary/30 to-primary/10 rounded-full blur-2xl opacity-30 animate-float-slow" />
      </div>
      <main className="w-full max-w-5xl mx-auto flex-1 flex flex-col z-10">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            System Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time system performance and status monitoring
          </p>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="bg-card/80 backdrop-blur-sm border-border/50 animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <Icon className={`w-4 h-4 ${getStatusColor(stat.status)}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {Math.round(stat.value)}{stat.unit}
                  </div>
                  <Progress 
                    value={stat.value} 
                    className="h-2 mb-2"
                  />
                  <Badge 
                    variant={stat.status === "good" ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {stat.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Network Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-secondary" />
                <span>Network Status</span>
              </CardTitle>
              <CardDescription>Current network connection details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">{networkInfo.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed:</span>
                <span className="font-medium">{networkInfo.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency:</span>
                <span className="font-medium">{networkInfo.latency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Used:</span>
                <span className="font-medium">{networkInfo.dataUsed}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Leo Status</span>
              </CardTitle>
              <CardDescription>AI assistant system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Core:</span>
                <Badge className="bg-secondary text-secondary-foreground">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voice Recognition:</span>
                <Badge className="bg-secondary text-secondary-foreground">Ready</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Neural Networks:</span>
                <Badge className="bg-secondary text-secondary-foreground">Optimized</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Response Time:</span>
                <span className="font-medium text-secondary">&lt; 100ms</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Processes */}
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-foreground" />
              <span>Active Processes</span>
            </CardTitle>
            <CardDescription>Currently running system processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Leo AI Core", cpu: "15%", memory: "245 MB", status: "Running" },
                { name: "Voice Recognition", cpu: "8%", memory: "128 MB", status: "Running" },
                { name: "Neural Processing", cpu: "22%", memory: "512 MB", status: "Running" },
                { name: "System Monitor", cpu: "3%", memory: "64 MB", status: "Running" },
              ].map((process, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <span className="font-medium">{process.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>CPU: {process.cpu}</span>
                    <span>Memory: {process.memory}</span>
                    <Badge variant="secondary" className="text-xs">
                      {process.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}