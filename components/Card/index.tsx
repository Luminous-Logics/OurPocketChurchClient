import React from "react";
import "./styles.scss";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children?: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`card-header ${className}`.trim()}>{children}</div>;
};

const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={`card-content ${className}`.trim()}>{children}</div>;
};

const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return <div className={`card-footer ${className}`.trim()}>{children}</div>;
};

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
