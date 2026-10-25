// src/components/SearchBox.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onSearch: (q: string) => void;
  placeholder?: string;
};

export default function SearchBox({
  value,
  onSearch,
  placeholder = "Cari data...",
}: Props) {
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // URL berubah dari luar (misalnya tombol back): ikuti nilainya
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  // Keyboard shortcut: tekan "/" untuk fokus ke input jika tidak sedang fokus di form element lain
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => onSearch(text.trim()), 350); // debounce
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  function handleClear() {
    setText("");
    onSearch("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-14 text-sm text-slate-900 shadow-2xs outline-hidden transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70"
      />
      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {text ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex size-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Hapus pencarian"
            aria-label="Hapus pencarian"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd
            title="Tekan / untuk mencari"
            className="hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block"
          >
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
