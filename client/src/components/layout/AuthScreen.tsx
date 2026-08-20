import type { ReactNode } from "react";

type AuthScreenProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  tone?: "yellow" | "pink";
};

const toneClasses = {
  yellow: "bg-[#ffd644]",
  pink: "bg-[#ff5f7e]",
} as const;

export const AuthScreen = ({
  icon,
  title,
  subtitle,
  children,
  footer,
  tone = "yellow",
}: AuthScreenProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ededed] px-4 py-12 font-[Inter,system-ui,sans-serif]">
      <div className="w-full max-w-105 border-2 border-black bg-white p-8 shadow-[6px_6px_0_0_#000] sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className={`mb-5 flex h-12 w-12 items-center justify-center border-2 border-black ${toneClasses[tone]} text-black shadow-[3px_3px_0_0_#000]`}
          >
            {icon}
          </div>
          <h1 className="text-[1.65rem] leading-none font-extrabold tracking-tight text-black uppercase">
            {title}
          </h1>
          <p className="mt-2.5 text-[0.95rem] text-neutral-500">{subtitle}</p>
        </div>

        {children}

        <div className="mt-8 border-t-2 border-black pt-6 text-center text-sm text-black">
          {footer}
        </div>
      </div>
    </div>
  );
};

export const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="10" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M16 11h6" />
  </svg>
);
