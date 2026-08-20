export type FieldTarget = "EXPENSE" | "INCOME";

export type FieldType =
  | "TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "CURRENCY"
  | "DATE"
  | "BOOLEAN"
  | "DROPDOWN"
  | "FILE";

export type FieldOptions = {
  choices: string[];
};

export type FieldDefinition = {
  id: string;
  tenantId: string;
  target: FieldTarget;
  key: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  enabled: boolean;
  sortOrder: number;
  options: FieldOptions | null;
  showInReports: boolean;
  visibleToNormalUser: boolean;
  defaultValue: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateFieldPayload = {
  target: FieldTarget;
  key?: string;
  label: string;
  fieldType: FieldType;
  required?: boolean;
  enabled?: boolean;
  sortOrder?: number;
  options?: FieldOptions;
  showInReports?: boolean;
  visibleToNormalUser?: boolean;
  defaultValue?: unknown;
};

export type UpdateFieldPayload = {
  label?: string;
  fieldType?: FieldType;
  required?: boolean;
  enabled?: boolean;
  sortOrder?: number;
  options?: FieldOptions | null;
  showInReports?: boolean;
  visibleToNormalUser?: boolean;
  defaultValue?: unknown | null;
};

export const FIELD_TARGETS: FieldTarget[] = ["EXPENSE", "INCOME"];

export const FIELD_TYPES: FieldType[] = [
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "CURRENCY",
  "DATE",
  "BOOLEAN",
  "DROPDOWN",
  "FILE",
];

export const fieldTypeLabel = (fieldType: FieldType) => {
  switch (fieldType) {
    case "TEXT":
      return "Text";
    case "LONG_TEXT":
      return "Long text";
    case "NUMBER":
      return "Number";
    case "CURRENCY":
      return "Currency";
    case "DATE":
      return "Date";
    case "BOOLEAN":
      return "Boolean";
    case "DROPDOWN":
      return "Dropdown";
    case "FILE":
      return "File";
    default:
      return fieldType;
  }
};

export const targetLabel = (target: FieldTarget) =>
  target === "EXPENSE" ? "Expense" : "Income";

export const sortFields = (fields: FieldDefinition[]) =>
  [...fields].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
  );

export const enabledFields = (fields: FieldDefinition[]) =>
  sortFields(fields).filter((field) => field.enabled);
