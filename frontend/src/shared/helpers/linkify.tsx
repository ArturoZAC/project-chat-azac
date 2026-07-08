import type { ReactNode } from "react";

/**
 * Convierte URLs en texto a elementos <a> clicables.
 * Ej: "Mira esto http://example.com" → "Mira esto " + <a>http://example.com</a>
 */
export function linkify(text: string): ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts = text.split(urlRegex);

if (parts.length === 1) {
    // No hay URLs, devolvemos el texto tal cual
    return text;
  }

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
