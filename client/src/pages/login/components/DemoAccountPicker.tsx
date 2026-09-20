export type DemoAccount = {
  email: string;
  label: string;
  description: string;
  role: string;
};

type DemoAccountPickerProps = {
  accounts: DemoAccount[];
  selectedEmail: string | null;
  disabled?: boolean;
  onSelect: (account: DemoAccount) => void;
};

export const DemoAccountPicker = ({
  accounts,
  selectedEmail,
  disabled = false,
  onSelect,
}: DemoAccountPickerProps) => {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-surface)_88%,white)] px-4 py-4">
      <p className="text-sm text-(--fms-muted)">Try a demo persona</p>

      <ul className="mt-3">
        {accounts.map((account) => {
          const selected = selectedEmail === account.email;

          return (
            <li key={account.email}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(account)}
                className={`flex w-full items-center justify-between gap-4 border-y px-2 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selected
                    ? "border-(--fms-border) bg-[color-mix(in_srgb,var(--fms-accent)_8%,transparent)]"
                    : "border-transparent hover:border-(--fms-border) hover:bg-[color-mix(in_srgb,var(--fms-accent)_6%,transparent)]"
                }`}
              >
                <span className="text-sm text-(--fms-ink)">{account.label}</span>
                <span className="truncate font-mono text-sm text-(--fms-accent)">
                  {account.email}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-relaxed text-(--fms-muted)">
        <li>Click any persona email above to fill in your address.</li>
        <li>Password is added securely when you sign in.</li>
      </ul>
    </div>
  );
};
