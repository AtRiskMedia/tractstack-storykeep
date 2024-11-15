// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "astro:assets" {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  export function getImage(options: any): Promise<any>;
}

declare namespace App {
  interface Locals {
    user?: {
      isAuthenticated: boolean;
    };
  }
}

interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

interface ImportMetaEnv {
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION: string;
  // ... other env vars
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
