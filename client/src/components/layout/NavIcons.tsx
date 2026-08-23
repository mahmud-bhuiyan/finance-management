import type { ReactNode } from "react";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const BrandMark = () => (
  <span className="brand-mark" aria-hidden="true">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 12 4 8.5M12 12l8-3.5M12 12v8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  </span>
);

const Ico = ({ d }: { d: ReactNode }) => (
  <svg className="nav-ico" {...iconProps}>
    {d}
  </svg>
);

export const navIconFor = (to: string) => {
  switch (to) {
    case "/":
      return (
        <Ico
          d={
            <>
              <path d="M4 11.5 12 4l8 7.5" />
              <path d="M6.5 10.5V20h11v-9.5" />
            </>
          }
        />
      );
    case "/dashboard":
      return (
        <Ico
          d={
            <>
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="4" rx="1.5" />
              <rect x="13" y="10" width="7" height="10" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
            </>
          }
        />
      );
    case "/reports":
      return (
        <Ico
          d={
            <>
              <path d="M4 19V6a1 1 0 0 1 1-1h10l5 5v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
              <path d="M15 5v5h5" />
              <path d="M8 13h8M8 17h5" />
            </>
          }
        />
      );
    case "/expenses":
      return (
        <Ico
          d={
            <>
              <path d="M12 4v16" />
              <path d="M8 8h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h7" />
            </>
          }
        />
      );
    case "/incomes":
      return (
        <Ico
          d={
            <>
              <path d="M12 20V4" />
              <path d="m7 9 5-5 5 5" />
            </>
          }
        />
      );
    case "/expense-support":
      return (
        <Ico
          d={
            <>
              <path d="M4 7h16M4 12h16M4 17h10" />
            </>
          }
        />
      );
    case "/fields":
      return (
        <Ico
          d={
            <>
              <rect x="4" y="5" width="16" height="14" rx="2" />
              <path d="M8 10h8M8 14h5" />
            </>
          }
        />
      );
    case "/users":
      return (
        <Ico
          d={
            <>
              <circle cx="9" cy="8" r="3" />
              <path d="M4 19c.6-3 2.6-4.5 5-4.5S13.4 16 14 19" />
              <circle cx="17" cy="9" r="2.2" />
              <path d="M16.2 14.4c1.8.3 3.2 1.5 3.8 4.6" />
            </>
          }
        />
      );
    case "/tenants":
      return (
        <Ico
          d={
            <>
              <path d="M4 20V8l6-4 6 4v12" />
              <path d="M10 20v-6h4v6M16 20V11h4v9" />
            </>
          }
        />
      );
    case "/audit":
      return (
        <Ico
          d={
            <>
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </>
          }
        />
      );
    case "/access":
      return (
        <Ico
          d={
            <>
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </>
          }
        />
      );
    default:
      return (
        <Ico d={<circle cx="12" cy="12" r="3" />} />
      );
  }
};
