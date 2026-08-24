import type { ReactNode } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants } from "../hooks/useTenants";

const boldCompanyName = (name: string) => (
  <strong className="font-semibold text-(--fms-ink)">{name}</strong>
);

const confirmCopy = {
  deactivate: {
    title: (name: string) => `Deactivate ${name} company`,
    description: (name: string) => (
      <>
        For {boldCompanyName(name)}, admins and users will lose access until you
        reactivate this company. You can restore access anytime from the Inactive
        tab.
      </>
    ),
    confirmLabel: "Deactivate",
    variant: "danger" as const,
  },
  activate: {
    title: (name: string) => `Reactivate ${name} company`,
    description: (name: string) => (
      <>
        For {boldCompanyName(name)}, admins and users will be able to sign in
        again once this company is active.
      </>
    ),
    confirmLabel: "Reactivate",
    variant: "primary" as const,
  },
  delete: {
    title: (name: string) => `Delete ${name} company`,
    description: (name: string) => (
      <>
        For {boldCompanyName(name)}, this action is permanent and removes the
        company along with its admin accounts. Companies with financial records
        on file cannot be deleted.
      </>
    ),
    confirmLabel: "Delete permanently",
    variant: "danger" as const,
  },
} satisfies Record<
  string,
  {
    title: (name: string) => string;
    description: (name: string) => ReactNode;
    confirmLabel: string;
    variant: "danger" | "primary";
  }
>;

export const TenantConfirmModal = () => {
  const {
    confirmAction,
    closeConfirm,
    updateTenantStatus,
    deleteTenant,
    isUpdating,
    isDeleting,
    setError,
  } = useTenants();

  const companyName = confirmAction?.tenant.name ?? "";
  const copy = confirmAction ? confirmCopy[confirmAction.action] : null;
  const submitting =
    confirmAction?.action === "delete" ? isDeleting : isUpdating;

  const handleConfirm = async () => {
    if (!confirmAction) {
      return;
    }

    setError(null);
    try {
      if (confirmAction.action === "delete") {
        await deleteTenant(confirmAction.tenant.id);
      } else if (confirmAction.action === "deactivate") {
        await updateTenantStatus(confirmAction.tenant.id, "INACTIVE");
      } else {
        await updateTenantStatus(confirmAction.tenant.id, "ACTIVE");
      }
      closeConfirm();
    } catch (error) {
      setError(
        error instanceof ApiError ? error.message : "Action could not be completed",
      );
    }
  };

  return (
    <Modal
      open={!!confirmAction}
      title={copy ? copy.title(companyName) : "Confirm action"}
      onClose={closeConfirm}
      footer={
        <div className="flex flex-wrap justify-end gap-2 border-t border-(--fms-border) px-5 py-4">
          <Button type="button" variant="ghost" onClick={closeConfirm}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={copy?.variant ?? "primary"}
            disabled={submitting}
            onClick={() => void handleConfirm()}
          >
            {submitting ? "Working…" : copy?.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      }
    >
      {confirmAction && copy && (
        <p className="text-sm leading-relaxed text-(--fms-muted)">
          {copy.description(companyName)}
        </p>
      )}
    </Modal>
  );
};
