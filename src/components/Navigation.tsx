import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
// Lion logo
import lionLogo from '/lion.png';
import { 
  MessageSquare, 
  Settings, 
  Command, 
  Monitor, 
  User,
  Menu,
  X 
} from "lucide-react";

const navigationItems = [
  { icon: MessageSquare, label: "Chat", path: "/" },
  { icon: Command, label: "Commands", path: "/commands" },
  { icon: Monitor, label: "System", path: "/system" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: MessageSquare, label: "History", path: "/history" }
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Only render navigation sidebar if not on Profile page
  if (location.pathname === "/profile") {
    return null;
  }
  // ...existing code...
};