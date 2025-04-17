/**
 * App version injected as a build-time global variable in Vite.
 */
declare const APP_VERSION: string;

interface ImportMeta {
  env: Record<string, string | boolean | undefined>;
}
