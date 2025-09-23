import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "medium", 
  children, 
  icon,
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 transition-all duration-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 transition-all duration-200",
    danger: "bg-gradient-to-r from-error to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-200"
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading ? (
        <ApperIcon name="Loader2" className="h-4 w-4 animate-spin mr-2" />
      ) : icon ? (
        <ApperIcon name={icon} className="h-4 w-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;