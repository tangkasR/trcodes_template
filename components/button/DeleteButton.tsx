"use client";

import React from "react";
import { LoaderCircle } from "lucide-react";

interface DeleteButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const DeleteButton = ({
  children,
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: DeleteButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg bg-red-600 px-4 py-2
        text-sm font-medium text-white
        transition-colors duration-200
        hover:bg-red-700
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
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

export default DeleteButton;
