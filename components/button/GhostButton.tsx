"use client";

import React from "react";
import { LoaderCircle } from "lucide-react";

interface GhostButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const GhostButton = ({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: GhostButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}

      {children}
    </button>
  );
};

export default GhostButton;
