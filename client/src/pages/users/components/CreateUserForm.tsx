import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type {
  CreateTenantUserPayload,
  TenantUserRole,
} from "../../../lib/users";

type CreateUserFormProps = {
  submitting: boolean;
  onSubmit: (payload: CreateTenantUserPayload) => Promise<void>;
};

export const CreateUserForm = ({
  submitting,
  onSubmit,
}: CreateUserFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<TenantUserRole>("NORMAL_USER");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      email: email.trim(),
      password,
      role,
      ...(name.trim() ? { name: name.trim() } : {}),
    });
    setEmail("");
    setPassword("");
    setName("");
    setRole("NORMAL_USER");
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="surface p-5"
    >
      <h2 className="text-lg font-medium text-slate-900">Invite user</h2>
      <p className="mt-1 text-sm text-slate-600">
        Create a company admin or read-only normal user for this company.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={submitting}
          autoComplete="off"
        />
        <Input
          label="Temporary password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          disabled={submitting}
          autoComplete="new-password"
        />
        <Input
          label="Name (optional)"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          disabled={submitting}
        />
        <label className="block space-y-2 text-sm text-slate-700">
          <span className="font-medium text-slate-800">Role</span>
          <select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as TenantUserRole)
            }
            disabled={submitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-teal-700/30 focus:ring-2"
          >
            <option value="NORMAL_USER">Normal user (read-only)</option>
            <option value="COMPANY_ADMIN">Company admin</option>
          </select>
        </label>
      </div>
      <div className="mt-4">
        <Button
          type="submit"
          disabled={submitting || !email.trim() || password.length < 8}
        >
          {submitting ? "Creating…" : "Create user"}
        </Button>
      </div>
    </form>
  );
};
