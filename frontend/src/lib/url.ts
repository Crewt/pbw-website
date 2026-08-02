// Defense-in-depth for hrefs that originate from CMS content. A stored value
// like `javascript:…` (or `data:`, `vbscript:`) would otherwise be executable
// when rendered into an <a href>. safeHref returns the URL only when it uses a
// safe scheme (or is a relative path/fragment), otherwise undefined so the
// caller can drop the link. isAllowedHref is the boolean form for form validation.

const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  // Relative paths and fragments carry no scheme and are always safe.
  if (/^(\/|\.\/|\.\.\/|#|\?)/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_SCHEMES.includes(parsed.protocol) ? trimmed : undefined;
  } catch {
    // Scheme-less host-like values (e.g. "www.example.de") are common admin
    // input. Retry with an https:// prefix; if that parses to an http(s) URL,
    // return the prefixed form so it renders as a working link.
    try {
      const prefixed = `https://${trimmed}`;
      const parsed = new URL(prefixed);
      if (ALLOWED_SCHEMES.includes(parsed.protocol) && parsed.hostname.includes(".")) {
        return prefixed;
      }
    } catch {
      /* fall through */
    }
    return undefined;
  }
}

export function isAllowedHref(url: string | null | undefined): boolean {
  return safeHref(url) !== undefined;
}
