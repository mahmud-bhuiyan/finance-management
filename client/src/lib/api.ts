export const API_VERSION = "v1";

const apiOrigin = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const API_BASE = `${apiOrigin}/api/${API_VERSION}`;

/** Paths are relative to API_BASE, e.g. `/auth/login` → `/api/v1/auth/login`. */
const toApiPath = (path: string) => {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/^\/api(?:\/v\d+)?(?=\/|$)/, "") || "/";
};

type ApiErrorBody = {
  ok?: boolean;
  message?: string;
  code?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE}${toApiPath(path)}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    throw new ApiError(
      data.message ?? "Request failed",
      response.status,
      data.code,
    );
  }

  return data;
};

/** Multipart upload — do not set Content-Type (browser sets boundary). */
export const apiUpload = async <T>(
  path: string,
  formData: FormData,
): Promise<T> => {
  const response = await fetch(`${API_BASE}${toApiPath(path)}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as ApiErrorBody & T;

  if (!response.ok) {
    throw new ApiError(
      data.message ?? "Upload failed",
      response.status,
      data.code,
    );
  }

  return data;
};

export const apiDownloadBlob = async (path: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE}${toApiPath(path)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      data.message ?? "Download failed",
      response.status,
      data.code,
    );
  }

  return response.blob();
};
