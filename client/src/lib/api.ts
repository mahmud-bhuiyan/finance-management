export const API_VERSION = "v1";

const apiOrigin = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const API_BASE = `${apiOrigin}/api/${API_VERSION}`;

/** Paths are relative to API_BASE, e.g. `/auth/login` → `/api/v1/auth/login`. */
const toApiPath = (path: string) => {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/^\/api(?:\/v\d+)?(?=\/|$)/, "") || "/";
};

export type ApiErrorDetail = {
  path: string;
  message: string;
};

export type ApiErrorBody = {
  message: string;
  code?: string;
  details?: ApiErrorDetail[];
};

export type ApiSuccessEnvelope<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorEnvelope = {
  success: false;
  error: ApiErrorBody;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: ApiErrorDetail[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const parseErrorBody = (body: unknown): ApiErrorBody => {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;

    if (record.success === false && record.error && typeof record.error === "object") {
      const error = record.error as ApiErrorBody;
      return {
        message: error.message ?? "Request failed",
        code: error.code,
        details: error.details,
      };
    }
  }

  return { message: "Request failed" };
};

const unwrapSuccess = <T>(body: unknown): T => {
  if (body && typeof body === "object" && "success" in body) {
    const record = body as ApiSuccessEnvelope<T>;
    if (record.success === true) {
      return record.data;
    }
  }

  return body as T;
};

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

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = parseErrorBody(body);
    throw new ApiError(
      error.message,
      response.status,
      error.code,
      error.details,
    );
  }

  return unwrapSuccess<T>(body);
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

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = parseErrorBody(body);
    throw new ApiError(
      error.message,
      response.status,
      error.code,
      error.details,
    );
  }

  return unwrapSuccess<T>(body);
};

export const apiDownloadBlob = async (path: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE}${toApiPath(path)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = parseErrorBody(body);
    throw new ApiError(
      error.message,
      response.status,
      error.code,
      error.details,
    );
  }

  return response.blob();
};
