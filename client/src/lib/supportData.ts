import { apiFetch } from "./api";

export const SUPPORT_KINDS = ["category", "department", "vendor"] as const;
export type SupportKind = (typeof SUPPORT_KINDS)[number];

export type SupportItem = {
  id: string;
  tenantId: string;
  name: string;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupportPayload = {
  name: string;
  notes?: string;
  active?: boolean;
};

export type UpdateSupportPayload = {
  name?: string;
  notes?: string | null;
  active?: boolean;
};

export type SupportRef = {
  id: string;
  name: string;
};

const pathFor: Record<SupportKind, string> = {
  category: "/categories",
  department: "/departments",
  vendor: "/vendors",
};

const listKey: Record<SupportKind, "categories" | "departments" | "vendors"> = {
  category: "categories",
  department: "departments",
  vendor: "vendors",
};

const itemKey: Record<SupportKind, "category" | "department" | "vendor"> = {
  category: "category",
  department: "department",
  vendor: "vendor",
};

export const supportKindLabel = (kind: SupportKind) => {
  switch (kind) {
    case "category":
      return "Categories";
    case "department":
      return "Departments";
    case "vendor":
      return "Vendors";
  }
};

export const supportKindSingular = (kind: SupportKind) => {
  switch (kind) {
    case "category":
      return "Category";
    case "department":
      return "Department";
    case "vendor":
      return "Vendor";
  }
};

export const listSupportItems = async (
  kind: SupportKind,
  options?: { includeInactive?: boolean; active?: boolean },
) => {
  const params = new URLSearchParams();
  if (options?.includeInactive) {
    params.set("includeInactive", "true");
  }
  if (options?.active !== undefined) {
    params.set("active", String(options.active));
  }
  const query = params.toString();
  const path = `${pathFor[kind]}${query ? `?${query}` : ""}`;
  const data = await apiFetch<Record<string, SupportItem[]>>(path);
  return data[listKey[kind]] ?? [];
};

export const createSupportItem = async (
  kind: SupportKind,
  payload: CreateSupportPayload,
) => {
  const data = await apiFetch<Record<string, SupportItem>>(pathFor[kind], {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data[itemKey[kind]];
};

export const updateSupportItem = async (
  kind: SupportKind,
  id: string,
  payload: UpdateSupportPayload,
) => {
  const data = await apiFetch<Record<string, SupportItem>>(`${pathFor[kind]}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data[itemKey[kind]];
};

export const deleteSupportItem = async (kind: SupportKind, id: string) => {
  await apiFetch(`${pathFor[kind]}/${id}`, {
    method: "DELETE",
  });
};
