import {
  DeleteIcon,
  EditIcon,
  IconActionButton,
  IconActionLink,
  PauseIcon,
  ReactivateIcon,
} from "../../../components/ui/ActionIcons";
import type { Tenant } from "../lib/tenantApi";

type TenantTableActionsProps = {
  tenant: Tenant;
  isActiveTab: boolean;
  disabled: boolean;
  onDeactivate: () => void;
  onActivate: () => void;
  onDelete: () => void;
};

export const TenantTableActions = ({
  tenant,
  isActiveTab,
  disabled,
  onDeactivate,
  onActivate,
  onDelete,
}: TenantTableActionsProps) => (
  <div className="flex items-center justify-center gap-1">
    <IconActionLink
      to={`/tenants/${tenant.id}/edit`}
      label="Edit company"
    >
      <EditIcon />
    </IconActionLink>

    {isActiveTab ? (
      <IconActionButton
        label="Deactivate company"
        disabled={disabled}
        onClick={onDeactivate}
      >
        <PauseIcon />
      </IconActionButton>
    ) : (
      <IconActionButton
        label="Reactivate"
        disabled={disabled}
        onClick={onActivate}
      >
        <ReactivateIcon />
      </IconActionButton>
    )}

    {!isActiveTab ? (
      <IconActionButton
        label="Delete company"
        tone="rose"
        disabled={disabled}
        onClick={onDelete}
      >
        <DeleteIcon />
      </IconActionButton>
    ) : null}
  </div>
);
