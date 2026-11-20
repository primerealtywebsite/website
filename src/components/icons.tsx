import type { SVGProps } from "react";

/** Custom real-estate line icons (24px grid, 1.75 stroke). */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSell = (p: P) => (
  <Svg {...p}>
    <path d="M3 11.5 10 5l7 6.5V20H3z" />
    <path d="M8 20v-5h4v5" />
    <path d="M17 4v8" />
    <rect x="15.5" y="6" width="6" height="4" rx=".6" />
  </Svg>
);
export const IconBuy = (p: P) => (
  <Svg {...p}>
    <path d="M3 11 12 3.5 21 11" />
    <path d="M5 9.5V20h6" />
    <circle cx="16" cy="15" r="2.6" />
    <path d="m17.9 16.8 3.1 3.2M19.6 18.5l-1 1" />
  </Svg>
);
export const IconKey = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="15" r="4.5" />
    <circle cx="8" cy="15" r="1.3" />
    <path d="m11.3 11.8 8.2-8.3M16.5 6.5l2.3 2.3M14.3 8.7l1.8 1.8" />
  </Svg>
);
export const IconCommunity = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 20V12l4.5-4 4.5 4v8" />
    <path d="M12.5 20v-9.5L17 6.5l4.5 4V20" />
    <path d="M1.5 20h21M6 20v-3h2v3M16 20v-3h2v3M15.5 12.5h3" />
  </Svg>
);
export const IconBuilding = (p: P) => (
  <Svg {...p}>
    <path d="M4 21V5.5L13 3v18" />
    <path d="M13 9h7v12" />
    <path d="M2.5 21h19M7 7.5h3M7 11h3M7 14.5h3M16 12.5h1.5M16 16h1.5M8 21v-3h2v3" />
  </Svg>
);
export const IconClipboard = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4V2.8h6V4M8.5 10l1.5 1.5 3-3M8.5 16h7" />
  </Svg>
);
export const IconBadge = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="6" width="17" height="13" rx="2" />
    <path d="M9 6V4h6v2" />
    <circle cx="9" cy="12" r="2" />
    <path d="M6 16.5c.6-1.3 1.7-2 3-2s2.4.7 3 2M14 11h4M14 14h3" />
  </Svg>
);
export const IconGauge = (p: P) => (
  <Svg {...p}>
    <path d="M3.5 17a8.5 8.5 0 1 1 17 0" />
    <path d="m12 17 4-5.5" />
    <circle cx="12" cy="17" r="1.4" />
    <path d="M6.5 13.2 5.3 12.5M12 8.3V7M17.5 13.2l1.2-.7" />
  </Svg>
);
export const IconPhone = (p: P) => (
  <Svg {...p}>
    <path d="M5 3.5h3.2l1.6 4.2-2 1.4a11 11 0 0 0 7.1 7.1l1.4-2 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8C10.4 20.3 3.7 13.6 3.2 5.4A1.8 1.8 0 0 1 5 3.5z" />
  </Svg>
);
export const IconArrow = (p: P) => (
  <Svg {...p}>
    <path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" />
  </Svg>
);
export const IconBack = (p: P) => (
  <Svg {...p}>
    <path d="M20 12H5M10.5 6.5 5 12l5.5 5.5" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m4.5 12.5 4.5 4.5 10.5-11" />
  </Svg>
);
export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
  </Svg>
);
export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6z" />
    <path d="m8.8 12 2.2 2.2 4.3-4.4" />
  </Svg>
);
export const IconPin = (p: P) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);
export const IconDoc = (p: P) => (
  <Svg {...p}>
    <path d="M6 2.5h8l4.5 4.5v14.5H6z" />
    <path d="M14 2.5V7h4.5M9 12h6M9 15.5h6M9 9h2.5" />
  </Svg>
);
export const IconMail = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
  </Svg>
);
export const IconWrench = (p: P) => (
  <Svg {...p}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-2-2 6.7-6.7" />
    <path d="M14.7 6.3 9.3 11.7a4 4 0 1 1-5-5l1.6 1.6 2.4-.6.6-2.4-1.6-1.6a4 4 0 0 1 5 5" />
  </Svg>
);
export const IconCalculator = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2" />
    <rect x="8" y="5.5" width="8" height="3.5" rx=".6" />
    <path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" strokeWidth={2.4} />
  </Svg>
);
export const IconSearch = (p: P) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Svg>
);
export const IconChat = (p: P) => (
  <Svg {...p}>
    <path d="M4 5.5h16v10.5H9.5L5 20v-4H4z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Svg>
);
export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Svg>
);
export const IconMenu = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconChevron = (p: P) => (
  <Svg {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.5" />
  </Svg>
);
export const IconWave = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 15c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6M2.5 19c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6" />
    <path d="M7 11V6.5L12 3l5 3.5V11" />
  </Svg>
);
