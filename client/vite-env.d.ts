/**
 * App version injected as a build-time global variable in Vite.
 */
declare const APP_VERSION: string;
/**
 * Feature flags (originally as a stringified JSON)
 */
declare const ENABLED_FEATURES: string;

interface ImportMeta {
  env: Record<string, string | boolean | undefined>;
}
