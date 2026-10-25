// src/app/providers.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError } from "@/common/utils/errors";

// Zod's JIT feature test uses Function(""), which a nonce-based CSP blocks.
z.config({ jitless: true });

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (
                error instanceof ApiError &&
                error.status >= 400 &&
                error.status < 500
              )
                return false;
              return failureCount < 2;
            },
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
