import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  delay?: number;
}

const GlassCard = ({ children, className, title, delay = 0 }: GlassCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("glass p-6 rounded-3xl", className)}
    >
      {title && <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">{title}</h3>}
      {children}
    </motion.div>
  );
};

export default GlassCard;
