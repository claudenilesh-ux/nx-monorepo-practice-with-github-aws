import { requiredValue } from "@nx-learning/config";
import type { Project } from "@nx-learning/project-data";
export interface ApiProject extends Project {
  createdAt: string;
  updatedAt: string;
}
export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "PROJECT_NOT_FOUND"
  | "SLUG_CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNAVAILABLE";
export class ProjectsApiError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
  }
}
function project(value: unknown): value is ApiProject {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      p.id,
    ) &&
    typeof p.name === "string" &&
    typeof p.slug === "string" &&
    typeof p.createdAt === "string" &&
    Number.isFinite(Date.parse(p.createdAt)) &&
    new Date(p.createdAt).toISOString() === p.createdAt &&
    typeof p.updatedAt === "string" &&
    Number.isFinite(Date.parse(p.updatedAt)) &&
    new Date(p.updatedAt).toISOString() === p.updatedAt
  );
}
function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
export class ProjectsApi {
  private readonly origin: string;
  constructor(
    origin: string,
    private readonly token: () => Promise<string | null>,
  ) {
    const url = new URL(requiredValue("NEXT_PUBLIC_API_URL", origin));
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== origin ||
      url.username ||
      url.password ||
      (url.protocol === "http:" &&
        !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
      throw new Error("Invalid API origin");
    this.origin = origin;
  }
  private async request(
    method: string,
    path: string,
    name?: string,
    signal?: AbortSignal,
  ): Promise<unknown> {
    let token: string | null;
    try {
      token = await this.token();
    } catch {
      throw new ProjectsApiError("UNAUTHORIZED");
    }
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (!token) throw new ProjectsApiError("UNAUTHORIZED");
    let response: Response;
    try {
      response = await fetch(`${this.origin}/api/projects${path}`, {
        method,
        signal,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(name === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(name === undefined ? {} : { body: JSON.stringify({ name }) }),
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      throw new ProjectsApiError("UNAVAILABLE");
    }
    if (!response.ok) {
      let body: Record<string, unknown> | null = null;
      try {
        body = record(await response.json());
      } catch {
        /* Invalid error response. */
      }
      const code = record(body?.error)?.code;
      const expected: Record<number, ApiErrorCode> = {
        400: "VALIDATION_ERROR",
        401: "UNAUTHORIZED",
        404: "PROJECT_NOT_FOUND",
        409: "SLUG_CONFLICT",
        413: "PAYLOAD_TOO_LARGE",
      };
      const mapped = expected[response.status];
      throw new ProjectsApiError(
        response.status === 401
          ? "UNAUTHORIZED"
          : mapped && code === mapped
            ? mapped
            : "UNAVAILABLE",
      );
    }
    const status = method === "POST" ? 201 : method === "DELETE" ? 204 : 200;
    if (response.status !== status) throw new ProjectsApiError("UNAVAILABLE");
    if (status === 204) return null;
    try {
      return await response.json();
    } catch {
      throw new ProjectsApiError("UNAVAILABLE");
    }
  }
  async list(signal?: AbortSignal): Promise<ApiProject[]> {
    const body = record(await this.request("GET", "", undefined, signal));
    if (!Array.isArray(body?.projects) || !body.projects.every(project))
      throw new ProjectsApiError("UNAVAILABLE");
    return body.projects;
  }
  private async mutation(
    method: string,
    path: string,
    name: string,
    signal?: AbortSignal,
  ): Promise<ApiProject> {
    const body = record(await this.request(method, path, name, signal));
    if (!project(body?.project)) throw new ProjectsApiError("UNAVAILABLE");
    return body.project;
  }
  create(name: string, signal?: AbortSignal) {
    return this.mutation("POST", "", name, signal);
  }
  rename(id: string, name: string, signal?: AbortSignal) {
    return this.mutation("PATCH", `/${encodeURIComponent(id)}`, name, signal);
  }
  async delete(id: string, signal?: AbortSignal) {
    await this.request(
      "DELETE",
      `/${encodeURIComponent(id)}`,
      undefined,
      signal,
    );
  }
}
