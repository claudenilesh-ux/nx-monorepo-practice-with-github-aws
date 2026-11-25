import { validateProjectName } from "@nx-learning/project-data";
import { getPrisma } from "../database/prisma";

export class ProjectError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function projectName(body: unknown): { name: string; slug: string } {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    !("name" in body) ||
    typeof body.name !== "string"
  ) {
    throw new ProjectError(400, "VALIDATION_ERROR", "Invalid project name");
  }
  const result = validateProjectName(body.name, []);
  if (result.error || result.name === undefined || result.slug === undefined)
    throw new ProjectError(400, "VALIDATION_ERROR", "Invalid project name");
  return { name: result.name, slug: result.slug };
}

const select = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} as const;
const notFound = () =>
  new ProjectError(404, "PROJECT_NOT_FOUND", "Project not found");

export async function listProjects(ownerId: string) {
  return getPrisma().project.findMany({
    where: { ownerId },
    select,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}
export async function createProject(ownerId: string, body: unknown) {
  return getPrisma().project.create({
    data: { ownerId, ...projectName(body) },
    select,
  });
}
export async function renameProject(
  ownerId: string,
  id: string,
  body: unknown,
) {
  const value = projectName(body);
  const current = await getPrisma().project.findFirst({
    where: { id, ownerId },
    select,
  });
  if (!current) throw notFound();
  if (current.name === value.name) return current;
  return getPrisma().project.update({
    where: { id, ownerId },
    data: value,
    select,
  });
}
export async function deleteProject(ownerId: string, id: string) {
  await getPrisma().project.delete({ where: { id, ownerId } });
}
