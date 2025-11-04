import React from "react";
import "./styles.scss";

export interface BadgeProps {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "danger";
  children?: React.ReactNode;
  className?: string;
}

const Badge = ({
  variant = "primary",
  children,
  className = "",
}: BadgeProps) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
};

export default Badge;
