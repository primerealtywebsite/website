import "server-only";

/**
 * Same menu on every page: the MLS home search and listing pages come from the old Laravel app, which
 * drew its own (old) header and footer, so the menu "changed" when visitors clicked Search homes for
 * sale. This reads the current site's own header, footer and mobile action bar from /site-chrome and
 * puts them into the old app's pages inside a declarative Shadow DOM: server-rendered (no flash), and
 * isolated in both directions (the old Bootstrap CSS can't distort the menu, and the site's CSS can't
 * restyle the old listings).
 */
type Chrome = { header: string; footer: string; bar: string; css: string[]; fontFaces: string; fontVars: string; htmlClass: string };

let cache: { at: number; value: Chrome } | null = null;
let inflight: Promise<Chrome | null> | null = null;
const TTL = 10 * 60_000;

/** The element that starts at `start`, including its balanced nested tags of the same name. */
function element(html: string, marker: string): string {
  const at = html.indexOf(marker);
  if (at < 0) return "";
  const start = html.lastIndexOf("<", at);
  const tag = /^<([a-z]+)/i.exec(html.slice(start))?.[1];
  if (!tag) return "";
  const re = new RegExp(`<${tag}\\b|</${tag}>`, "gi");
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index + m[0].length);
  }
  return "";
}

async function load(origin: string): Promise<Chrome | null> {
  const r = await fetch(`${origin}/site-chrome`, { headers: { "user-agent": "Prime1SiteChrome/1.0" }, signal: AbortSignal.timeout(8_000) });
  if (!r.ok) return null;
  const html = await r.text();
  const header = element(html, 'data-site-chrome="header"');
  const footer = element(html, 'data-site-chrome="footer"');
  const bar = element(html, 'data-site-chrome="mobilebar"');
  const css = [...new Set([...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/_next\/[^"]+\.css[^"]*)"/g)].map((m) => m[1]))];
  const htmlClass = /<html[^>]*\sclass="([^"]*)"/.exec(html)?.[1] ?? "";
  if (!header || !css.length) return null;
  // @font-face only works at document level (not inside a shadow root), so it is copied out of the CSS.
  const sheets = await Promise.all(css.map((h) => fetch(`${origin}${h}`, { signal: AbortSignal.timeout(8_000) }).then((x) => (x.ok ? x.text() : "")).catch(() => "")));
  const fontFaces = sheets.flatMap((s) => s.match(/@font-face\s*{[^}]*}/g) ?? []).join("");
  // next/font puts --font-serif / --font-body on <html> classes; the chrome hosts need the same values.
  const all = sheets.join("\n");
  const fontVars = htmlClass
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => new RegExp(`\\.${cls.replace(/[^\w-]/g, "")}\\s*{([^}]*)}`).exec(all)?.[1] ?? "")
    .join(";");
  return { header, footer, bar, css, fontFaces, fontVars, htmlClass };
}

export async function getChrome(origin: string): Promise<Chrome | null> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  inflight ??= load(origin)
    .then((value) => {
      if (value) cache = { at: Date.now(), value };
      return value ?? cache?.value ?? null;
    })
    .catch((e) => {
      console.error("[site-chrome] load failed", e instanceof Error ? e.message : e);
      return cache?.value ?? null;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

const BEHAVIOR = `(function(){
document.querySelectorAll('template[shadowrootmode]').forEach(function(t){var p=t.parentNode;if(p&&!p.shadowRoot){var s=p.attachShadow({mode:'open'});s.appendChild(t.content);t.remove()}});
var h=document.getElementById('p1-header');if(!h||!h.shadowRoot)return;var r=h.shadowRoot,menu=r.getElementById('mobile-menu'),btn=r.querySelector('[aria-controls="mobile-menu"]'),hd=r.querySelector('header');
function t(el,a,b,on){if(el){el.classList.toggle(a,on);el.classList.toggle(b,!on)}}
function open(on){if(!menu)return;t(menu,'visible','invisible',on);t(menu.children[0],'opacity-100','opacity-0',on);t(menu.children[1],'translate-x-0','translate-x-full',on);document.documentElement.style.overflow=on?'hidden':'';if(btn)btn.setAttribute('aria-expanded',String(on))}
if(btn)btn.addEventListener('click',function(){open(true)});
r.querySelectorAll('[aria-label="Close menu"]').forEach(function(b){b.addEventListener('click',function(){open(false)})});
if(menu)menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){open(false)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')open(false)});
var SH='shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)]';function sc(){if(hd)hd.classList.toggle(SH,window.scrollY>8)}addEventListener('scroll',sc,{passive:true});sc();
})();`;

/** Swap the old MLS template's header and footer for the site's own (returns the html unchanged if unavailable). */
export function applyChrome(html: string, c: Chrome): string {
  if (!/<header>[\s\S]*?<\/header>/.test(html)) return html;
  const links = c.css.map((h) => `<link rel="stylesheet" href="${h}">`).join("");
  const shadow = (inner: string) =>
    `<template shadowrootmode="open">${links}<style>:host{display:block}.p1c{font-family:var(--font-sans);color:var(--color-ink);font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased;text-align:left;line-height:1.5;font-size:16px;letter-spacing:normal;text-transform:none;word-spacing:normal}</style><div class="p1c ${c.htmlClass}">${inner}</div></template>`;
  const head = `<style>${c.fontFaces}#p1-header,#p1-footer,#p1-bar{${c.fontVars}}#p1-header{position:sticky;top:0;z-index:2000}#p1-bar{position:relative;z-index:1500}@media (max-width:767px){body{padding-bottom:calc(76px + env(safe-area-inset-bottom))}}</style>`;
  return html
    .replace(/<\/head>/i, `${head}</head>`)
    .replace(/<header>[\s\S]*?<\/header>/, `<div id="p1-header">${shadow(c.header)}</div>`)
    .replace(/<footer>[\s\S]*?<\/footer>/, c.footer ? `<div id="p1-footer">${shadow(c.footer)}</div>` : "$&")
    .replace(/<\/body>/i, `${c.bar ? `<div id="p1-bar">${shadow(c.bar)}</div>` : ""}<script>${BEHAVIOR}</script></body>`);
}
