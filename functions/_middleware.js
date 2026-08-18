// Cloudflare Pages Function
// Only handles the bare root path ("/"). Every other path (assets, /ja/, /en/,
// /eo/, etc.) is passed straight through to the static site untouched.
//
// This runs at the edge, before the response body is generated, so it works
// for real browsers (no JavaScript needed) and for any crawler that sends an
// Accept-Language header. It never blocks a request from reaching a specific
// language page directly — hreflang links and direct URLs always work.

const SUPPORTED_LANGS = ["ja", "en", "eo"];
const FALLBACK_LANG = "en";

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.pathname !== "/") {
    return next();
  }

  const acceptLanguage = request.headers.get("Accept-Language") || "";

  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0].split("-")[0].toLowerCase())
    .find((lang) => SUPPORTED_LANGS.includes(lang));

  const target = preferred || FALLBACK_LANG;

  // 302 (temporary): the right target can change per visitor/request, so we
  // don't want this cached as a permanent redirect by browsers or search
  // engines.
  return Response.redirect(new URL(`/${target}/`, url.origin), 302);
}
