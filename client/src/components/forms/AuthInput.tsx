import { useState, type InputHTMLAttributes, type ReactElement } from "react";

type AuthInputIcon = "email" | "user" | "password";

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
  icon?: AuthInputIcon;
  type?: "text" | "email" | "password";
};

const iconClassName = "h-[18px] w-[18px]";

const EmailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={iconClassName}
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={iconClassName}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="9.5" r="2.5" />
    <path d="M7.5 18.5c.8-2.4 2.7-3.5 4.5-3.5s3.7 1.1 4.5 3.5" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={iconClassName}
    aria-hidden="true"
  >
    <rect x="5" y="11" width="14" height="10" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={iconClassName}
    aria-hidden="true"
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="square"
    strokeLinejoin="miter"
    className={iconClassName}
    aria-hidden="true"
  >
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
    <label className="block space-y-2 text-sm text-black">
      <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
      <div className="relative">
        {FieldIcon && (
          <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-neutral-500">
            <FieldIcon />
          </span>
        )}
        <input
          id={inputId}
          type={inputType}
          className={`w-full border-2 border-black bg-white py-2.5 text-black shadow-[4px_4px_0_0_#000] outline-none placeholder:text-neutral-400 focus:translate-x-px focus:translate-y-px focus:shadow-[3px_3px_0_0_#000] ${paddingClass} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-neutral-500 transition-colors hover:text-black"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </label>
  );
};
