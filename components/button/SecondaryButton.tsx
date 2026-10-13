"use client";

import React from "react";
import { LoaderCircle } from "lucide-react";

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const SecondaryButton = ({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: SecondaryButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg border border-gray-300 bg-white px-4 py-2
        text-sm font-medium text-gray-700
        transition-colors duration-200
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" />}

      {children}
    </button>
  );
};

export default SecondaryButton;
