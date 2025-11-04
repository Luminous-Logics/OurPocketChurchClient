/* eslint-disable @next/next/no-img-element */
import React from "react";
import "./styles.scss";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar = ({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className = "",
}: AvatarProps) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const showFallback = !src || imageError;
  const displayFallback = fallback ? getInitials(fallback) : "?";

  return (
    <div className={`avatar avatar-${size} ${className}`.trim()}>
      {showFallback ? (
        <span className="avatar-fallback">{displayFallback}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="avatar-image"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

export default Avatar;
