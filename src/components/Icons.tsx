interface IconProps {
  className?: string;
}

const base = (props: IconProps) => ({
  className: props.className ?? "w-5 h-5",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
});

export const IconHome = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 12.5 9.5 18 20 6.5" /></svg>
);
export const IconTasks = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="4" width="17" height="16" rx="3" /><path d="m8 12.5 2.5 2.5L16 9.5" /></svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
);
export const IconBook = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></svg>
);
export const IconNote = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 4h14v11l-5 5H5z" /><path d="M14 20v-5h5M9 9h6M9 12.5h4" /></svg>
);
export const IconWallet = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M16.5 14.5h.01" /></svg>
);
export const IconFlame = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 3s5.5 4.5 5.5 10a5.5 5.5 0 0 1-11 0C6.5 8.5 9 7 9 7s-.5 2.5 1 3.5C10 6 12 3 12 3z" /></svg>
);
export const IconTarget = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconGear = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M4.5 6.5l1.7 1.7M17.8 17.8l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.5 17.5l1.7-1.7M17.8 6.2l1.7-1.7" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}><path d="M4.5 6.5h15M9.5 6V4.5h5V6M7 6.5 8 20h8l1-13.5M10.5 10.5v6M13.5 10.5v6" /></svg>
);
export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20h4.5L20 8.5 15.5 4 4 15.5z" /><path d="m13 6.5 4.5 4.5" /></svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="m14.5 5.5-6.5 6.5 6.5 6.5" /></svg>
);
export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}><path d="m9.5 5.5 6.5 6.5-6.5 6.5" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);
export const IconSun = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></svg>
);
export const IconMoon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" /></svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4v11M7.5 11 12 15.5 16.5 11M4.5 19.5h15" /></svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconTrendUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m3.5 17 5.5-5.5 3.5 3.5 8-8" /><path d="M15 7h5.5v5.5" /></svg>
);
export const IconTrendDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m3.5 7 5.5 5.5L12.5 9l8 8" /><path d="M15 17h5.5v-5.5" /></svg>
);
