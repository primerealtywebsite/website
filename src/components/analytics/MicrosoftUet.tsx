import Script from "next/script";
import { site } from "@/config/site";

/** Microsoft Advertising UET base tag (page views; SPA route changes tracked automatically). Conversions come from lib/meta.ts track(). */
export function MicrosoftUet() {
  const id = site.msUetId;
  if (!id) return null;
  return (
    <Script id="ms-uet" strategy="afterInteractive">
      {`(function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${id}",enableAutoSpaTracking:true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");`}
    </Script>
  );
}
