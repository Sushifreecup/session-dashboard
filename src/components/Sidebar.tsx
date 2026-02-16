import React from "react";
import { Home, List, Shield, Settings, User } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: List, label: "Sessions", href: "/sessions" },
    { icon: Shield, label: "Vulnerabilities", href: "#" },
    { icon: User, label: "Profiles", href: "#" },
    { icon: Settings, label: "Settings", href: "#" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Shield className="text-white" size={24} />
        </div>
        <h1 className="font-bold text-xl tracking-tight">SessionSafe</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-blue-400 text-gray-400 group"
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="glass-pill p-4 rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">Administrator</span>
          <span className="text-sm font-semibold">Alexis</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
