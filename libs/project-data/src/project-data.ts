export interface Project { id: string; name: string; slug: string }
export type NameResult = { name: string; slug: string; error?: undefined } | { error: string; name?: string; slug?: string };

export function validateProjectName(input: string, projects: Project[], excludeId?: string): NameResult {
  const name = input.trim().replace(/ +/g, ' ');
  if (!name || name.length > 100 || !/^[A-Za-z0-9 -]+$/.test(name) || !/[A-Za-z0-9]/.test(name)) {
    return { error: 'Enter 1–100 characters using letters, numbers, spaces or hyphens.' };
  }
  const slug = name.toLowerCase().replace(/[ -]+/g, '-').replace(/^-|-$/g, '');
  if (projects.some(project => project.id !== excludeId && project.slug === slug)) return { error: 'A project with this slug already exists.', name, slug };
  return { name, slug };
}

const keyFor = (userId: string) => `nx-learning:projects:v1:${userId}`;
type ProjectStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readProjects(storage: Pick<ProjectStorage, 'getItem'>, userId: string): Project[] {
  const raw = storage.getItem(keyFor(userId));
  if (raw === null) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error('Invalid project data');
  const projects: Project[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null || typeof item.id !== 'string' || !item.id || typeof item.name !== 'string' || typeof item.slug !== 'string') throw new Error('Invalid project data');
    const valid = validateProjectName(item.name, projects);
    if (valid.error || valid.name !== item.name || valid.slug !== item.slug || projects.some(project => project.id === item.id)) throw new Error('Invalid project data');
    projects.push({ id: item.id, name: item.name, slug: item.slug });
  }
  return projects;
}
export function writeProjects(storage: Pick<ProjectStorage, 'setItem'>, userId: string, projects: Project[]): void {
  storage.setItem(keyFor(userId), JSON.stringify(projects));
}
