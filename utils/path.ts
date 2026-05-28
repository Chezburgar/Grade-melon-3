// Hardcoded basePath helper. Next.js `basePath` does NOT auto-prefix
// raw <img> src attributes — `assetPrefix` only affects Next-generated
// URLs like /_next/static/*. So any public-folder asset referenced
// directly in JSX needs this prefix applied manually.
export const BASE_PATH = "/Grade-melon-3";

export function asset(path: string): string {
  return BASE_PATH + (path.startsWith("/") ? path : "/" + path);
}
