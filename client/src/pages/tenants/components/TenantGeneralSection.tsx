import { TenantFormSection } from "./TenantFormSection";
import { TenantNameEditor } from "./TenantNameEditor";
import { TenantSlugEditor } from "./TenantSlugEditor";

type TenantGeneralSectionProps = {
  currentName: string;
  currentSlug: string;
  submitting: boolean;
  onUpdateName: (name: string) => Promise<void>;
  onUpdateSlug: (slug: string) => Promise<void>;
};

export const TenantGeneralSection = ({
  currentName,
  currentSlug,
  submitting,
  onUpdateName,
  onUpdateSlug,
}: TenantGeneralSectionProps) => (
  <TenantFormSection
    title="General"
    description="Update the display name and URL slug for this company."
  >
    <div className="space-y-5">
      <TenantNameEditor
        currentName={currentName}
        submitting={submitting}
        onConfirmChange={onUpdateName}
      />

      <TenantSlugEditor
        currentSlug={currentSlug}
        submitting={submitting}
        onConfirmChange={onUpdateSlug}
      />
    </div>
  </TenantFormSection>
);
