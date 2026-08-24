import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ApiError } from "../../../lib/api";
import { useTenants } from "../hooks/useTenants";

const confirmCopy = {
  deactivate: {
    title: "Mark company inactive",
    body: (name: string) =>
      `Mark ${name} inactive? Company admins and users cannot sign in while the company is inactive.`,
    confirmLabel: "Mark inactive",
    variant: "danger" as const,
  },
  activate: {
    title: "Reactivate company",
    body: (name: string) =>
      `Reactivate ${name}? Users will be able to sign in again.`,
    confirmLabel: "Reactivate",
    variant: "primary" as const,
  },
  delete: {
    title: "Delete company",
    body: (name: string) =>
      `Permanently delete ${name}? This removes the company and its admins. Companies with financial records cannot be deleted.`,
    confirmLabel: "Delete company",
    variant: "danger" as const,
  },
};

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
      title={copy?.title ?? "Confirm action"}
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
        <p className="text-sm text-(--fms-ink)">
          {copy.body(confirmAction.tenant.name)}
        </p>
      )}
    </Modal>
  );
};
