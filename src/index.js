// Cloudflare Worker entry point (referenced as "main" in wrangler.jsonc).
//
// This project is deployed as a Worker with static assets (not classic
// Cloudflare Pages), so custom request handling lives here rather than in a
// Pages "functions/" directory.
//
// Behavior:
//   - "/"           → 302 redirect to /ja/, /en/, or /eo/, based on the
//                      visitor's Accept-Language header (no JavaScript
//                      required on the client, so this also works for
//                      crawlers that send Accept-Language).
//   - every other path (assets, /ja/, /en/, /eo/, 404s, ...) → served
//                      directly from the static build via the ASSETS
//                      binding, unchanged.

const SUPPORTED_LANGS = ["ja", "en", "eo"];
const FALLBACK_LANG = "en";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const acceptLanguage = request.headers.get("Accept-Language") || "";

      const preferred = acceptLanguage
        .split(",")
        .map((part) => part.trim().split(";")[0].split("-")[0].toLowerCase())
        .find((lang) => SUPPORTED_LANGS.includes(lang));

      const target = preferred || FALLBACK_LANG;

      // 302 (temporary): the right target can change per visitor/request,
      // so this should never be cached as a permanent redirect.
      return Response.redirect(new URL(`/${target}/`, url.origin), 302);
    }

    return env.ASSETS.fetch(request);
  },
};
