import Script from "next/script";
import { site } from "@/config/site";

/**
 * Google tag for Google Ads (AW-17574854752). Loads gtag.js (the client's pasted snippet pointed
 * at gtm.js, which only works for GTM-XXXX containers) and configures the account with enhanced
 * conversions. Conversion events are sent from lib/meta.ts `track()` alongside the Meta pixel.
 */
export function GoogleTag() {
  const id = site.googleAds.id;
  if (!id) return null;
  const phone = site.googleAds.labels.phone;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}',{allow_enhanced_conversions:true});${
          phone ? `gtag('config','${id}/${phone}',{phone_conversion_number:'${site.phone.display}'});` : ""
        }`}
      </Script>
    </>
  );
}
