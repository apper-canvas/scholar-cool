import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  required = false,
  children,
  ...props 
}) => {
  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <Select error={error} {...props}>
            {children}
          </Select>
        );
      case "textarea":
        return (
          <textarea
            className={`form-input ${error ? 'border-error focus:ring-error focus:border-error' : ''}`}
            rows={4}
            {...props}
          />
        );
      default:
        return <Input type={type} error={error} {...props} />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="form-label">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default FormField;