import "server-only";
import { site } from "@/config/site";

/**
 * SEO/AEO/GEO upgrade for MLS property pages served by the old app (/property/<id>).
 * The old pages all share one generic title/description/image, have no H1 and no structured data,
 * and carry a template block about "Apshawa Groves" / "New York City". This rewrites each page so
 * search engines and AI assistants see a unique, accurate listing:
 *  - title + meta description + Open Graph/Twitter from the listing's own address, price, beds, baths, size
 *  - the listing's first photo as the share image
 *  - the address as the page H1
 *  - RealEstateListing + Offer + home details JSON-LD (schema.org)
 *  - the wrong template text replaced with the listing's real city
 */

const CITIES = [
  "St. Petersburg", "St Petersburg", "Saint Petersburg", "Tampa", "Clearwater", "Brandon", "Riverview", "Largo", "Seminole", "Pinellas Park",
  "Wesley Chapel", "Lutz", "Land O' Lakes", "Land O Lakes", "Odessa", "Valrico", "Plant City", "Apollo Beach", "Ruskin", "Wimauma",
  "Sun City Center", "Gibsonton", "Seffner", "Thonotosassa", "Dunedin", "Palm Harbor", "Tarpon Springs", "Oldsmar", "Safety Harbor",
  "New Port Richey", "Port Richey", "Holiday", "Hudson", "Spring Hill", "Brooksville", "Zephyrhills", "Dade City", "Lakeland",
  "Bradenton", "Sarasota", "Parrish", "Palmetto", "Ellenton", "Lakewood Ranch", "Venice", "North Port", "Anna Maria", "Holmes Beach",
  "Treasure Island", "St. Pete Beach", "Madeira Beach", "Indian Rocks Beach", "Gulfport", "Kenneth City", "Temple Terrace", "Town 'n' Country",
  "Westchase", "Carrollwood", "Citrus Park", "Trinity", "Winter Haven", "Orlando", "Kissimmee", "Ocala", "Fort Myers", "Cape Coral",
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const decode = (s: string) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

function titleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Ne|Nw|Se|Sw|N|S|E|W)\b/g, (m) => m.toUpperCase())
    .replace(/\b(\d+)(St|Nd|Rd|Th)\b/g, (_, n, suf) => n + suf.toLowerCase());
}

function field(text: string, label: string) {
  const m = text.match(new RegExp(`${label}\\s*:?\\s*\\n+([^\\n]+)`, "i"));
  const v = m ? m[1].trim() : "";
  // The MLS app prints "N/A" (or "-") for missing values; treat those as empty so titles never say "N/A Bd".
  return /^(n\/?a|-+|none|null)$/i.test(v) ? "" : v;
}

export type Listing = {
  address: string;
  city: string;
  mls: string;
  price: number | null;
  beds: string;
  baths: string;
  living: number | null;
  lot: number | null;
  year: string;
  type: string;
  status: string;
  description: string;
  photos: string[];
};

export function parseListing(html: string): Listing | null {
  const body = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "");
  const text = decode(body.replace(/<[^>]+>/g, "\n"))
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  const cite = html.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i);
  const address = cite ? decode(cite[1].replace(/<[^>]+>/g, "")).trim() : "";
  if (!address) return null;

  const lines = text.split("\n");
  // The address also appears in the breadcrumb; use the occurrence right above the "Details" block.
  const detailsIdx = lines.findIndex((l, i) => l === "Details" && i > 0);
  let addrIdx = -1;
  for (let i = (detailsIdx > 0 ? detailsIdx : lines.length) - 1; i >= 0; i--) if (lines[i] === address) { addrIdx = i; break; }
  // Listing remarks: the long paragraphs right before the address/Details block.
  const remarks: string[] = [];
  for (let i = addrIdx - 1; i >= 0 && remarks.length < 8; i--) {
    if (lines[i].length > 80) remarks.unshift(lines[i]);
    else if (remarks.length) break;
  }
  const description = remarks.join(" ").replace(/\s+/g, " ").replace(/^[“"']+|[”"']+$/g, "").trim();
  const num = (s: string) => {
    const n = Number(s.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const city =
    CITIES.find((c) => new RegExp(`\\b${c.replace(/[.']/g, (x) => `\\${x}`)}\\b`, "i").test(description))?.replace(/^St Petersburg$|^Saint Petersburg$/, "St. Petersburg") ?? "";

  // Main gallery photos share the first photo's folder (similar-home photos use other folders).
  const allPhotos = [...html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/https:\/\/[a-z0-9.-]+cloudfront\.net\/[^"' )]+\.(?:jpe?g|webp|png)/gi)].map((m) => m[0]);
  const folder = allPhotos[0]?.split("/").slice(0, -1).join("/");
  const photos = [...new Set(allPhotos.filter((p) => folder && p.startsWith(folder + "/")))].slice(0, 12);

  return {
    address,
    city,
    mls: field(text, "Property ID"),
    price: num(field(text, "Current Price") || field(text, "Listing Price")),
    beds: field(text, "Bedrooms"),
    baths: field(text, "Bathrooms"),
    living: num(field(text, "Property Living Area")),
    lot: num(field(text, "Property Size")),
    year: field(text, "Year Built"),
    type: field(text, "Property Type"),
    status: field(text, "Property Status"),
    description,
    photos,
  };
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export function optimizeListingHtml(html: string, pageUrl: string): string {
  const L = parseListing(html);
  if (!L) return html;
  const addr = titleCase(L.address);
  const place = L.city ? `${addr}, ${L.city}, FL` : `${addr}, FL`;
  const isRental = /lease|rent/i.test(L.type) || (L.price !== null && L.price < 15000);
  const priceTxt = L.price ? (isRental ? `${money(L.price)}/mo` : money(L.price)) : "";
  const specs = [L.beds && `${L.beds} Bed`, L.baths && `${L.baths} Bath`, L.living && `${L.living.toLocaleString("en-US")} Sq Ft`].filter(Boolean).join(", ");
  const status = /sold|closed/i.test(L.status) ? "Sold" : /pending|contract/i.test(L.status) ? "Pending" : isRental ? "For Rent" : "For Sale";

  const short = [L.beds && `${L.beds} Bd`, L.baths && `${L.baths} Ba`].filter(Boolean).join(" ");
  const placeShort = L.city ? `${addr}, ${L.city} FL` : `${addr}, FL`;
  let title = [placeShort, short, priceTxt].filter(Boolean).join(" | ");
  if (title.length > 72) title = [placeShort, priceTxt || short].filter(Boolean).join(" | ");
  const lead = `${status}: ${place}${specs ? `. ${specs}` : ""}${priceTxt ? `, ${priceTxt}` : ""}${L.mls ? `. MLS# ${L.mls}` : ""}.`;
  const descBody = L.description ? ` ${L.description}` : " Tour it with Prime 1 Realty: (813) 295-8215.";
  let desc = (lead + descBody).replace(/\s+/g, " ");
  if (desc.length > 158) desc = desc.slice(0, 155).replace(/\s+\S*$/, "") + "…";
  const image = L.photos[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${pageUrl}#listing`,
    url: pageUrl,
    name: `${place}${specs ? ` (${specs})` : ""}`,
    description: L.description || lead,
    ...(L.photos.length ? { image: L.photos } : {}),
    ...(L.mls ? { identifier: { "@type": "PropertyValue", propertyID: "MLS#", value: L.mls } } : {}),
    ...(L.price
      ? {
          offers: {
            "@type": "Offer",
            price: L.price,
            priceCurrency: "USD",
            businessFunction: isRental ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
            availability: status === "Sold" ? "https://schema.org/SoldOut" : status === "Pending" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
            seller: { "@id": `${site.url}/#organization` },
          },
        }
      : {}),
    mainEntity: {
      "@type": /condo|town/i.test(L.type + L.description) ? "Apartment" : /land|lot/i.test(L.type) ? "Landform" : "SingleFamilyResidence",
      name: place,
      address: { "@type": "PostalAddress", streetAddress: addr, ...(L.city ? { addressLocality: L.city } : {}), addressRegion: "FL", addressCountry: "US" },
      ...(L.beds ? { numberOfBedrooms: Number(L.beds) || L.beds } : {}),
      ...(L.baths ? { numberOfBathroomsTotal: Number(L.baths) || L.baths } : {}),
      ...(L.living ? { floorSize: { "@type": "QuantitativeValue", value: L.living, unitCode: "FTK" } } : {}),
      ...(L.year ? { yearBuilt: Number(L.year) || L.year } : {}),
    },
    provider: { "@id": `${site.url}/#organization` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Home search", item: `${site.url}/home-search` },
        { "@type": "ListItem", position: 3, name: place, item: pageUrl },
      ],
    },
  };

  const where = L.city || "Florida";
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="product">`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${esc(place)}">`)
    .replace(/<link rel="canonical" href="[^"]*"/i, `<link rel="canonical" href="${esc(pageUrl)}"`)
    .replace(/<meta property="og:url" content="[^"]*"/i, `<meta property="og:url" content="${esc(pageUrl)}"`);
  if (image) {
    out = out
      .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${esc(image)}">`)
      .replace(/<meta property="og:image:(width|height)" content="[^"]*"\s*\/?>/gi, "");
  }
  // Address becomes the page's single H1 (styled like the original line).
  out = out.replace(/<cite([^>]*)>([\s\S]*?)<\/cite>/i, `<h1$1 style="font:inherit;margin:0;color:inherit">${esc(place)}</h1>`);
  // Fix the wrong template copy.
  out = out
    .replace(/Apshawa Groves/g, esc(where))
    .replace(/When you're ready to relocate from New York City, you'll find/g, "You'll find")
    .replace(/Antony Oseitutu are local and experienced real estate agents who specialize and surrounding suburbs/g, `Antony Oseitutu is a local, experienced broker who specializes in ${esc(where)} and the surrounding communities,`)
    .replace(/This adept skill has earned Antony Oseitutu has earned/g, "This has earned Antony Oseitutu")
    .replace(/hudreds/g, "hundreds");
  const head = `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">${image ? `<meta name="twitter:image" content="${esc(image)}">` : ""}<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`;
  out = out.replace(/<\/head>/i, `${head}</head>`);
  // Listing inquiries go through the site's own lead pipeline with the property address and MLS number.
  const broker = (html.match(/Listed by ([^<\n]+)/i)?.[1] ?? "").trim();
  return bridgeListingForms(out, { address: place, mls: L.mls, price: priceTxt, broker, rental: isRental });
}

/**
 * The old MLS app's "Enquire Now" and "Schedule a tour" forms posted to the old Laravel app (outside the
 * site's lead routing, without MLS#, and with SMS consent copy although the office line is calls only).
 * This replaces the consent copy, hides the stray "Services" box and sends both forms to /api/lead with
 * the property address, MLS number, price and listing brokerage, so they reach the office like every
 * other website lead (Resend email, Sheets, Meta CAPI).
 */
export function bridgeListingForms(html: string, p: { address: string; mls: string; price: string; broker: string; rental: boolean }) {
  const consent = `By submitting, you agree that Prime 1 Realty may call or email you about this property and your inquiry. Our office line is calls only. <a href="/privacy-policy">Privacy Policy</a> &amp; <a href="/term-conditions">Terms and Conditions</a>.`;
  let out = html
    .replace(/By providing your phone number, you agree to receive SMS messages[\s\S]*?Terms and Conditions<\/a><\/span>\./g, consent);
  out = out.replace(/<div class="mb-3 form-group">(\s*<label for="lead_service"[\s\S]*?<\/div>\s*<\/div>)/, '<div class="mb-3 form-group" style="display:none">$1');
  const data = JSON.stringify(p).replace(/</g, "\\u003c");
  const script = `<script>(function(){var P=${data};function v(f,n){var e=f.querySelector('[name="'+n+'"]');return e?String(e.value||'').trim():''}
function utm(){try{var o={},q=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','gbraid','wbraid','fbclid'].forEach(function(k){var x=q.get(k);if(x)o[k]=x});return o}catch(e){return{}}}
document.addEventListener('submit',function(e){var f=e.target;if(!f||!(f.id==='enquiryForm'||(f.classList&&f.classList.contains('form-schedule'))))return;e.preventDefault();e.stopImmediatePropagation();
var tour=f.id!=='enquiryForm',name=v(f,'name'),phone=v(f,'phone'),email=v(f,'email'),msg=v(f,'message'),box=tour?null:document.getElementById('enqAlert');
function say(t,ok){if(box){box.className='enq-alert '+(ok?'enq-ok':'enq-fail');box.textContent=t;box.style.display='block'}else{alert(t)}}
if(name.length<2||phone.replace(/\\D/g,'').length<10){say('Please enter your name and a 10-digit phone number.',false);return}
var a={'Property address':P.address,'MLS number':P.mls,'List price':P.price,'Listing brokerage':P.broker,'Request':tour?'Schedule a tour':'Property inquiry'};
if(tour){a['Tour date']=v(f,'date');a['Tour time']=v(f,'time')||((f.querySelector('#time-selector .current')||{}).textContent||'');['agent_represented','financial','timeframe'].forEach(function(k){var x=v(f,k);if(x)a[k.replace('_',' ')]=x})}
Object.keys(a).forEach(function(k){if(!a[k])delete a[k]});var b=f.querySelector('button[type=submit],button:not([type])');if(b)b.disabled=true;
var id='lst-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({leadType:P.rental?'rent':'buy',name:name,phone:phone,email:email,message:msg,smsConsent:!!(f.querySelector('[name="consent"]')||{}).checked,answers:a,eventId:id,pageUrl:location.href,utm:utm()})})
.then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok||!j.ok)throw 0;say(tour?'Tour request sent. A licensed Prime 1 professional will confirm the time with you.':'Thank you. A licensed Prime 1 professional will contact you about this property.',true);f.reset();try{window.clarity&&clarity('event','listing_lead')}catch(_){}})})
.catch(function(){say('We could not send that. Please call (813) 295-8215.',false)}).finally(function(){if(b)b.disabled=false})},true)})();</script>`;
  return out.replace(/<\/body>/i, `${script}</body>`);
}
