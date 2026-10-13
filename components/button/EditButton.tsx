"use client";

import React from "react";
import { LoaderCircle } from "lucide-react";

interface EditButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const EditButton = ({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: EditButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg bg-yellow-600 px-4 py-2
        text-sm font-medium text-white
        transition-colors duration-200
        hover:bg-yellow-700
        focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
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

export default EditButton;
