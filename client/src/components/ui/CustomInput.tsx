import { forwardRef } from "react";
import { FaUser } from "react-icons/fa";

type CustomInputProps = {
  type: string;
  placeholder: string;
  id: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ type, placeholder, id, error, ...props }, ref) => {
    return (
      <div className={`custom-input ${error ? "custom-input--error" : ""}`}>
        <FaUser className="custom-input__icon" size={24} />
        <input
          ref={ref}
          className="custom-input__field"
          type={type}
          placeholder={placeholder}
          id={id}
          {...props}
        />
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
