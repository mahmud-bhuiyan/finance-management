import { useState, type InputHTMLAttributes, type ReactElement } from "react";

type AuthInputIcon = "email" | "user" | "password";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  icon?: AuthInputIcon;
  type?: "text" | "email" | "password";
};

const iconClassName = "h-[18px] w-[18px]";

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: iconClassName,
  "aria-hidden": true,
};

const EmailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="3" />
    <path d="M5.5 19c.8-3 2.8-4.5 6.5-4.5s5.7 1.5 6.5 4.5" />
  </svg>
);

const LockIcon = () => (
  <svg {...iconProps}>
    <rect x="5" y="11" width="14" height="9" rx="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M3 3l18 18" />
  </svg>
);

const fieldIcons: Record<AuthInputIcon, () => ReactElement> = {
  email: EmailIcon,
  user: UserIcon,
  password: LockIcon,
};

export const AuthInput = ({
  label,
  error,
  id,
  className = "",
  icon,
  type = "text",
  ...props
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? props.name;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  const FieldIcon = icon ? fieldIcons[icon] : null;
  const paddingClass = `${FieldIcon ? "pl-10" : "pl-3"} ${isPassword ? "pr-10" : "pr-3"}`;

  return (
    <label className="block space-y-2 text-sm text-(--fms-muted)">
      <span className="block font-medium text-(--fms-ink)">{label}</span>
      <div className="relative">
        {FieldIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-(--fms-faint)">
            <FieldIcon />
          </span>
        )}
        <input
          id={inputId}
          type={inputType}
          className={`w-full py-2.5 text-(--fms-ink) ${paddingClass} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-md text-(--fms-faint) transition-colors hover:text-(--fms-ink)"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-(--fms-rose)">{error}</span>}
    </label>
  );
};
