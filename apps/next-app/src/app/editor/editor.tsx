"use client";
import { useEffect, useRef, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import { readProjects, writeProjects, validateProjectName, type Project } from "@nx-learning/project-data";
import type { SidebarTab, SicSidebar } from "@nx-learning/shared-sections";
import type { LitElement } from "lit";

// React needs types for these shared Lit custom elements and their events.
type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
const Navbar = "sic-editor-navbar" as React.ElementType<
  ElementProps & { sidebarOpen?: boolean; "onsidebar-toggle"?: () => void }
>;
const Sidebar = "sic-sidebar" as React.ElementType<
  ElementProps & {
    isOpen?: boolean;
    activeTab?: SidebarTab;
    projects?: Project[];
    selectedId?: string | null;
    "onproject-create"?: () => void;
    "onproject-select"?: (event: CustomEvent<{ id: string }>) => void;
    "onproject-edit"?: (event: CustomEvent<{ id: string }>) => void;
    "onproject-delete"?: (event: CustomEvent<{ id: string }>) => void;
    "onsidebar-close"?: () => void;
    "ontab-change"?: (event: CustomEvent<{ value: SidebarTab }>) => void;
  }
>;

const Dialog = "sic-project-dialog" as React.ElementType<ElementProps & {
  open?: boolean; mode?: "create" | "rename" | "delete"; project?: Project | null; projects?: Project[]; storageError?: string;
  "onproject-cancel"?: () => void;
  "onproject-submit"?: (event: CustomEvent<{ name: string; slug: string }>) => void;
}>;
const EmptyState = "uic-empty-state" as React.ElementType<ElementProps & { heading?: string }>;
const Icon = "uic-icon" as React.ElementType<ElementProps & { name?: string; size?: string }>;
const Button = "uic-button" as React.ElementType<ElementProps & { slot?: string }>;

export default function Editor() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/sign-in");
  }, [isLoaded, isSignedIn, router]);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("mine");
  const navbar = useRef<HTMLElement>(null);
  const sidebar = useRef<SicSidebar>(null);
  const projectDialog = useRef<HTMLElement>(null);
  const [store, setStore] = useState<{ userId: string; projects: Project[] } | null>(null);
  const [storageError, setStorageError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ mode: "create" | "rename" | "delete"; project: Project | null } | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    setStore(null); setSelectedId(null); setDialog(null); setStorageError("");
    if (!ready || !isLoaded || !isSignedIn || !userId) return;
    try { setStore({ userId, projects: readProjects(window.localStorage, userId) }); }
    catch { setStorageError("Unable to read local projects. Existing data was preserved."); }
  }, [ready, isLoaded, isSignedIn, userId]);
  const projects = store && store.userId === userId ? store.projects : [];
  const selected = projects.find(project => project.id === selectedId);
  const openDialog = (mode: "create" | "rename" | "delete", project: Project | null = null) => { submitting.current = false; setDialog({ mode, project }); };
  const submit = (event: CustomEvent<{ name: string; slug: string }>) => {
    if (!dialog || !store || store.userId !== userId || submitting.current) return;
    submitting.current = true;
    try {
      const current = readProjects(window.localStorage, store.userId);
      let next = current;
      let nextSelected = selectedId;
      if (dialog.mode === "delete" && dialog.project) {
        next = current.filter(project => project.id !== dialog.project?.id);
        if (selectedId === dialog.project.id) nextSelected = null;
      } else {
        const valid = validateProjectName(event.detail.name, current, dialog.project?.id);
        if (valid.error !== undefined || valid.slug !== event.detail.slug) {
          setStore({ userId: store.userId, projects: current });
          submitting.current = false;
          return;
        }
        if (dialog.mode === "create") {
          const project = { id: crypto.randomUUID(), name: valid.name, slug: valid.slug };
          next = [...current, project]; nextSelected = project.id;
        } else if (dialog.project) {
          next = current.map(project => project.id === dialog.project?.id ? { ...project, name: valid.name, slug: valid.slug } : project);
        }
      }
      if (next !== current) writeProjects(window.localStorage, store.userId, next);
      if (dialog.mode === "delete") {
        const nativeDialog = projectDialog.current?.shadowRoot?.querySelector("uic-modal")?.shadowRoot?.querySelector("dialog");
        nativeDialog?.addEventListener("close", () => {
          void (async () => {
            const currentSidebar = sidebar.current;
            if (!currentSidebar) return;
            await currentSidebar.updateComplete;
            const row = currentSidebar.shadowRoot?.querySelector<LitElement>("uic-list-item");
            if (row) await row.updateComplete;
            const target = row?.shadowRoot?.querySelector<HTMLButtonElement>("button.label")
              ?? currentSidebar.shadowRoot?.querySelector("footer uic-button")?.shadowRoot?.querySelector<HTMLButtonElement>("button");
            target?.focus();
          })();
        }, { once: true });
      }
      setStore({ userId: store.userId, projects: next }); setSelectedId(nextSelected); setStorageError("");
      if (dialog.mode === "create") setActiveTab("mine");
      setDialog(null);
    } catch { setStorageError("Unable to save local projects. Existing data was preserved."); submitting.current = false; }
  };

  // Register the Lit elements in the browser before rendering them.
  useEffect(() => {
    import("@nx-learning/shared-sections").then(() => {
      setSidebarOpen(window.innerWidth >= 768);
      setReady(true);
    });
  }, []);
  const closeSidebar = () => {
    setSidebarOpen(false);
    // Return keyboard focus to the button that opens the sidebar.
    navbar.current?.shadowRoot
      ?.querySelector("uic-icon-button")
      ?.shadowRoot?.querySelector("button")
      ?.focus();
  };
  if (!ready || !isLoaded || !isSignedIn) return null;
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <Navbar
        ref={navbar}
        sidebarOpen={sidebarOpen}
        onsidebar-toggle={() => setSidebarOpen((isOpen) => !isOpen)}
      ><div slot="right"><UserButton /></div></Navbar>
      <main
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          background: "var(--bg-base)",
          display: "block",
          margin: 0,
          padding: 0,
          maxWidth: "none",
        }}
      >
        <Sidebar
          ref={sidebar}
          isOpen={sidebarOpen}
          activeTab={activeTab}
          projects={projects}
          selectedId={selectedId}
          onproject-create={() => openDialog("create")}
          onproject-select={(event: CustomEvent<{id: string}>) => setSelectedId(event.detail.id)}
          onproject-edit={(event: CustomEvent<{id: string}>) => { const project = projects.find(item => item.id === event.detail.id); if (project) openDialog("rename", project); }}
          onproject-delete={(event: CustomEvent<{id: string}>) => { const project = projects.find(item => item.id === event.detail.id); if (project) openDialog("delete", project); }}
          onsidebar-close={closeSidebar}
          ontab-change={(event: CustomEvent<{ value: SidebarTab }>) =>
            setActiveTab(event.detail.value)
          }
        />
        {storageError && <p role="alert" style={{ color: "var(--state-error)", padding: "var(--space-4)" }}>{storageError}</p>}
        {store && store.userId === userId && <div style={{ height: "100%", display: "grid", placeItems: "center" }}>{selected ? <h1>{selected.name}</h1> : <EmptyState heading="No project selected"><Button slot="action" onClick={() => openDialog("create")}><Icon name="plus" size="sm" />Create Project</Button></EmptyState>}</div>}
        <Dialog ref={projectDialog} open={!!dialog} mode={dialog?.mode ?? "create"} project={dialog?.project ?? null} projects={projects} storageError={storageError} onproject-cancel={() => setDialog(null)} onproject-submit={submit} />
      </main>
    </div>
  );
}
