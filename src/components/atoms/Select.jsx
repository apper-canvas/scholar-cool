import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ 
  className, 
  children,
  error,
  placeholder,
  ...props 
}, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "form-input appearance-none pr-10",
          error && "border-error focus:ring-error focus:border-error",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <ApperIcon name="ChevronDown" className="h-4 w-4 text-gray-400" />
      </div>
    </div>
  );
});

Select.displayName = "Select";

export default Select;