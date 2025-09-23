import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className, 
  type = "text", 
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "form-input",
        error && "border-error focus:ring-error focus:border-error",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;