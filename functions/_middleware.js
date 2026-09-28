// Cloudflare Pages middleware: send www and the howtostartavegetablegarden.pages.dev copy to howtostartavegetablegarden.com; everything else is static.
// Per-deploy preview URLs (<hash>.howtostartavegetablegarden.pages.dev) stay reachable; Cloudflare serves them with noindex.
export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    if (url.hostname === 'www.howtostartavegetablegarden.com' || url.hostname === 'howtostartavegetablegarden.pages.dev') {
      url.hostname = 'howtostartavegetablegarden.com';
      return Response.redirect(url.toString(), 301);
    }
  } catch {}
  return context.next();
}
