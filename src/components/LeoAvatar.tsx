import { useState, useEffect } from "react";

interface AvatarProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export const LeoAvatar = ({ 
  isListening = false, 
  isSpeaking = false, 
  size = "lg" 
}: AvatarProps) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Simulate blinking animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32",
    xl: "w-48 h-48"
  };

  const getAnimationClass = () => {
    if (isSpeaking) return "animate-pulse-glow";
    if (isListening) return "animate-neural-pulse";
    return "animate-float";
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer subtle glow ring */}
      <div 
        className={`
          absolute inset-0 rounded-full bg-gradient-primary opacity-10 blur-2xl
          ${isListening ? "animate-pulse scale-105" : ""}
          ${isSpeaking ? "animate-pulse-glow scale-110" : ""}
        `}
      />
      
      {/* Main avatar container - no border, soft shadow */}
      <div 
        className={`
          relative ${sizeClasses[size]} rounded-full overflow-hidden
          bg-gradient-glass backdrop-blur-sm shadow-glow
          ${getAnimationClass()}
          transition-all duration-500 hover:scale-105
        `}
      >
        {/* Leo Avatar - Lion PNG image */}
        <img
          src="/lion.png"
          alt="Leo Lion Logo"
          className={`w-full h-full object-cover rounded-full ${isBlinking ? "brightness-50" : "brightness-100"} transition-brightness duration-150`}
        />
        
        {/* Status indicators - more subtle */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-secondary/40 animate-pulse-glow" />
        )}
        
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-neural-pulse" />
        )}
        
        {/* Neural circuit overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
      </div>
      
      {/* Status text */}
      {(isListening || isSpeaking) && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 bg-card/80 backdrop-blur-sm rounded-full border border-border/30">
            <span className="text-xs font-medium text-foreground">
              {isListening ? "Listening..." : "Speaking..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};