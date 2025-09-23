import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  className,
  ...props 
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "status-active",
    warning: "status-warning", 
    error: "status-error",
    info: "bg-info/10 text-info",
    inactive: "status-inactive"
  };

  return (
    <span
      className={cn(
        "status-badge",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;