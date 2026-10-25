import React from "react";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  nonce?: string;
};

/**
 * Komponen penyaji Schema.org JSON-LD yang aman untuk mesin pencari konvensional
 * dan mesin pencari generatif (GEO: ChatGPT, Perplexity, Google Gemini).
 */
export default function JsonLd({ data, nonce }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}


