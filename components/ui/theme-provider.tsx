'use client';

import { ReactNode } from 'react';

const themeVariables = `
  :root {
    /* Primary Colors */
    --color-primary: #1b5e3f;        /* Forest Green */
    --color-primary-light: #2d7d55;  /* Lighter Green */
    --color-primary-lighter: #e8f5f1; /* Very Light Green BG */

    /* Secondary Colors */
    --color-secondary: #0ea5a5;      /* Teal */
    --color-secondary-light: #14b8a6;
    --color-accent: #f59e0b;         /* Warm Amber */

    /* Neutrals - Warm */
    --color-bg: #faf9f7;             /* Warm Off-White */
    --color-bg-secondary: #f3f1ef;   /* Slightly Darker */
    --color-border: #e5e1dd;         /* Warm Border */
    --color-text: #1f2937;           /* Dark Gray */
    --color-text-muted: #6b7280;     /* Muted Gray */

    /* Status Colors */
    --color-success: #059669;        /* Green */
    --color-warning: #d97706;        /* Amber */
    --color-error: #dc2626;          /* Red */
    --color-info: #0284c7;           /* Blue */
  }
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{themeVariables}</style>
      {children}
    </>
  );
}
