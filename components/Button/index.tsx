import React from "react";
import "./styles.scss";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary" | "danger";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      icon,
      iconPosition = "left",
      isLoading = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonClass = `btn btn-${variant} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Loading...
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="btn-icon me-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="btn-icon ms-2">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
