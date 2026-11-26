"use client";
import { useEffect, useRef, useState } from "react";
import { UserButton, useAuth, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import {
  readProjects,
  validateProjectName,
  type Project,
} from "@nx-learning/project-data";
import type { SidebarTab, SicSidebar } from "@nx-learning/shared-sections";
import type { LitElement } from "lit";
import ProjectCanvas from "./project-canvas";
import { ProjectsApi, ProjectsApiError, type ApiProject } from "./projects-api";

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
    loading?: boolean;
    loadError?: boolean;
    "onproject-create"?: () => void;
    "onproject-select"?: (event: CustomEvent<{ id: string }>) => void;
    "onproject-edit"?: (event: CustomEvent<{ id: string }>) => void;
    "onproject-delete"?: (event: CustomEvent<{ id: string }>) => void;
    "onsidebar-close"?: () => void;
    "ontab-change"?: (event: CustomEvent<{ value: SidebarTab }>) => void;
  }
>;
const Dialog = "sic-project-dialog" as React.ElementType<
  ElementProps & {
    open?: boolean;
    mode?: "create" | "rename" | "delete";
    project?: Project | null;
    projects?: Project[];
    storageError?: string;
    validationError?: string;
    pending?: boolean;
    blocked?: boolean;
    "onproject-retry"?: () => void;
    "onproject-cancel"?: () => void;
    "onproject-submit"?: (
      event: CustomEvent<{ name: string; slug: string }>,
    ) => void;
  }
>;
const EmptyState = "uic-empty-state" as React.ElementType<
  ElementProps & { heading?: string }
>;
const Icon = "uic-icon" as React.ElementType<
  ElementProps & { name?: string; size?: string }
>;
const Button = "uic-button" as React.ElementType<
  ElementProps & { slot?: string }
>;
type Store = {
  identity: string;
  projects: ApiProject[];
  status: "loading" | "loaded" | "error";
};
type DialogState = {
  mode: "create" | "rename" | "delete";
  project: ApiProject | null;
};

export default function Editor({
  projectId = null,
}: {
  projectId?: string | null;
}) {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth();
  const router = useRouter();
  const { signOut } = useClerk();
  const identity =
    isLoaded && isSignedIn && userId && sessionId
      ? `${userId}:${sessionId}`
      : "";
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const requests = useRef(new Set<AbortController>());
  const loadVersion = useRef(0);
  const submitting = useRef(false);
  const rejected = useRef("");
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("mine");
  const [store, setStore] = useState<Store | null>(null);
  const selectedId = projectId;
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [rejectedIdentity, setRejectedIdentity] = useState("");
  const [signOutFailed, setSignOutFailed] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [legacy, setLegacy] = useState<{
    identity: string;
    projects: Project[] | null;
    error: boolean;
  } | null>(null);
  const navbar = useRef<HTMLElement>(null);
  const sidebar = useRef<SicSidebar>(null);
  const projectDialog = useRef<HTMLElement>(null);
  const visible = store?.identity === identity && identity ? store : null;
  const projects = visible?.projects ?? [];
  const selected =
    visible?.status === "loaded"
      ? projects.find((project) => project.id === selectedId)
      : undefined;

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/sign-in");
  }, [isLoaded, isSignedIn, router]);
  useEffect(() => {
    import("@nx-learning/shared-sections").then(() => {
      setSidebarOpen(window.innerWidth >= 768);
      setReady(true);
    });
  }, []);
  const clearProtected = () => {
    setStore(null);
    setDialog(null);
    setPending(false);
    submitting.current = false;
  };
  const endRejectedSession = async (id: string, rejectedSessionId: string) => {
    setSignOutFailed(false);
    try {
      await signOut({ sessionId: rejectedSessionId, redirectUrl: "/sign-in" });
    } catch {
      if (currentIdentity.current === id) setSignOutFailed(true);
    }
  };
  const rejectSession = (id: string) => {
    if (rejected.current === id || currentIdentity.current !== id || !sessionId)
      return;
    rejected.current = id;
    requests.current.forEach((controller) => controller.abort());
    requests.current.clear();
    ++loadVersion.current;
    clearProtected();
    setLegacy(null);
    setRejectedIdentity(id);
    void endRejectedSession(id, sessionId);
  };
  const client = () =>
    new ProjectsApi(process.env.NEXT_PUBLIC_API_URL ?? "", () => getToken());
  const load = async (id: string, retain = false): Promise<boolean> => {
    const version = ++loadVersion.current;
    const controller = new AbortController();
    requests.current.add(controller);
    setStore((previous) => ({
      identity: id,
      projects: retain && previous?.identity === id ? previous.projects : [],
      status: "loading",
    }));
    try {
      const list = await client().list(controller.signal);
      if (
        currentIdentity.current !== id ||
        version !== loadVersion.current ||
        controller.signal.aborted
      )
        return false;
      setStore({ identity: id, projects: list, status: "loaded" });
      return true;
    } catch (error) {
      if (
        currentIdentity.current !== id ||
        version !== loadVersion.current ||
        controller.signal.aborted
      )
        return false;
      if (error instanceof ProjectsApiError && error.code === "UNAUTHORIZED")
        rejectSession(id);
      else {
        setStore((previous) => ({
          identity: id,
          projects:
            retain && previous?.identity === id ? previous.projects : [],
          status: "error",
        }));
        setMessage("Unable to load projects. Retry to reconnect.");
      }
      return false;
    } finally {
      requests.current.delete(controller);
    }
  };
  useEffect(() => {
    requests.current.forEach((controller) => controller.abort());
    requests.current.clear();
    ++loadVersion.current;
    clearProtected();
    setMessage("");
    setValidationError("");
    setLegacy(null);
    if (rejected.current !== identity) {
      rejected.current = "";
      setRejectedIdentity("");
      setSignOutFailed(false);
    }
    if (!ready || !identity || !userId) return;
    try {
      setLegacy({
        identity,
        projects: readProjects(window.localStorage, userId),
        error: false,
      });
    } catch {
      setLegacy({ identity, projects: null, error: true });
    }
    void load(identity);
    return () => {
      requests.current.forEach((controller) => controller.abort());
      requests.current.clear();
      ++loadVersion.current;
    };
    // Identity determines the lifetime of all requests and protected state.
  }, [ready, identity, userId]);
  const openDialog = (
    mode: DialogState["mode"],
    project: ApiProject | null = null,
  ) => {
    if (visible?.status !== "loaded" || submitting.current) return;
    setMessage("");
    setValidationError("");
    setDialog({ mode, project });
  };
  const restoreDeleteFocus = () => {
    const nativeDialog = projectDialog.current?.shadowRoot
      ?.querySelector("uic-modal")
      ?.shadowRoot?.querySelector("dialog");
    nativeDialog?.addEventListener(
      "close",
      () => {
        void (async () => {
          const current = sidebar.current;
          if (!current) return;
          await current.updateComplete;
          const row =
            current.shadowRoot?.querySelector<LitElement>("uic-list-item");
          if (row) await row.updateComplete;
          const target =
            row?.shadowRoot?.querySelector<HTMLButtonElement>("button.label") ??
            current.shadowRoot
              ?.querySelector("footer uic-button")
              ?.shadowRoot?.querySelector<HTMLButtonElement>("button");
          target?.focus();
        })();
      },
      { once: true },
    );
  };
  const submit = async (event: CustomEvent<{ name: string; slug: string }>) => {
    if (
      !dialog ||
      !visible ||
      visible.status !== "loaded" ||
      submitting.current
    )
      return;
    if (dialog.mode !== "delete") {
      const result = validateProjectName(
        event.detail.name,
        projects,
        dialog.project?.id,
      );
      if (result.error || result.slug !== event.detail.slug) return;
    }
    const id = identity;
    const controller = new AbortController();
    requests.current.add(controller);
    submitting.current = true;
    setPending(true);
    setMessage("");
    setValidationError("");
    ++loadVersion.current;
    try {
      const api = client();
      const result =
        dialog.mode === "create"
          ? await api.create(event.detail.name, controller.signal)
          : dialog.mode === "rename" && dialog.project
            ? await api.rename(
                dialog.project.id,
                event.detail.name,
                controller.signal,
              )
            : dialog.project
              ? await api.delete(dialog.project.id, controller.signal)
              : null;
      if (currentIdentity.current !== id || controller.signal.aborted) return;
      if (dialog.mode === "delete" && dialog.project) {
        restoreDeleteFocus();
        setStore((previous) =>
          previous?.identity === id
            ? {
                ...previous,
                projects: previous.projects.filter(
                  (item) => item.id !== dialog.project?.id,
                ),
              }
            : previous,
        );
        if (selectedId === dialog.project.id) router.replace("/editor");
      } else if (result) {
        setStore((previous) =>
          previous?.identity === id
            ? {
                ...previous,
                projects:
                  dialog.mode === "create"
                    ? [result, ...previous.projects].sort(
                        (a, b) =>
                          b.createdAt.localeCompare(a.createdAt) ||
                          b.id.localeCompare(a.id),
                      )
                    : previous.projects.map((item) =>
                        item.id === result.id ? result : item,
                      ),
              }
            : previous,
        );
        if (dialog.mode === "create") {
          router.push(`/editor/${result.id}`);
          setActiveTab("mine");
        }
      }
      setDialog(null);
    } catch (error) {
      if (currentIdentity.current !== id || controller.signal.aborted) return;
      const code =
        error instanceof ProjectsApiError ? error.code : "UNAVAILABLE";
      if (code === "UNAUTHORIZED") rejectSession(id);
      else if (code === "PROJECT_NOT_FOUND") {
        setMessage("This project is no longer available. Refreshing projects.");
        await load(id, true);
        setDialog(null);
      } else if (code === "SLUG_CONFLICT")
        setValidationError("A project with this slug already exists.");
      else if (code === "VALIDATION_ERROR" || code === "PAYLOAD_TOO_LARGE")
        setValidationError("Project name is invalid or too large.");
      else {
        setMessage("The result is unknown. Refresh projects before retrying.");
        await load(id, true);
      }
    } finally {
      requests.current.delete(controller);
      if (currentIdentity.current === id && !controller.signal.aborted) {
        submitting.current = false;
        setPending(false);
      }
    }
  };
  const exportLegacy = () => {
    if (!legacy?.projects || legacy.identity !== identity) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(legacy.projects, null, 2)], {
        type: "application/json",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "archloom-local-projects.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const closeSidebar = () => {
    setSidebarOpen(false);
    navbar.current?.shadowRoot
      ?.querySelector("uic-icon-button")
      ?.shadowRoot?.querySelector("button")
      ?.focus();
  };
  if (!ready || !isLoaded || !isSignedIn || !identity) return null;
  if (rejectedIdentity === identity)
    return (
      <main>
        <p role="alert">
          {signOutFailed
            ? "Unable to sign out. Please try again."
            : "Session expired. Signing out…"}
        </p>
        {signOutFailed && (
          <Button
            onClick={() => {
              if (sessionId) void endRejectedSession(identity, sessionId);
            }}
          >
            Retry sign out
          </Button>
        )}
      </main>
    );
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <Navbar
        ref={navbar}
        sidebarOpen={sidebarOpen}
        onsidebar-toggle={() => setSidebarOpen((value) => !value)}
      >
        {selected && (
          <span
            slot="center"
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected.name}
          </span>
        )}
        <div slot="right">
          <UserButton />
        </div>
      </Navbar>
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
          selectedId={visible ? selectedId : null}
          loading={!visible || visible.status === "loading"}
          loadError={visible?.status === "error"}
          onproject-create={() => openDialog("create")}
          onproject-select={(event: CustomEvent<{ id: string }>) =>
            router.push(`/editor/${event.detail.id}`)
          }
          onproject-edit={(event: CustomEvent<{ id: string }>) => {
            const item = projects.find(
              (project) => project.id === event.detail.id,
            );
            if (item) openDialog("rename", item);
          }}
          onproject-delete={(event: CustomEvent<{ id: string }>) => {
            const item = projects.find(
              (project) => project.id === event.detail.id,
            );
            if (item) openDialog("delete", item);
          }}
          onsidebar-close={closeSidebar}
          ontab-change={(event: CustomEvent<{ value: SidebarTab }>) =>
            setActiveTab(event.detail.value)
          }
        />
        <div
          style={{
            position: "absolute",
            zIndex: 1,
            top: 0,
            right: 0,
            padding: "var(--space-4)",
          }}
        >
          {legacy?.identity === identity &&
            (legacy.error ? (
              <p role="alert">
                Local projects could not be read. Existing data was preserved.
              </p>
            ) : (
              !!legacy.projects?.length && (
                <p>
                  Legacy projects are local-only and not synchronized.{" "}
                  <Button onClick={exportLegacy}>Export JSON backup</Button>
                </p>
              )
            ))}
          {message && !dialog && <p role="alert">{message}</p>}
          {visible?.status === "error" && (
            <Button
              onClick={() => {
                setMessage("");
                void load(identity, true);
              }}
            >
              Retry loading projects
            </Button>
          )}
        </div>
        {visible?.status === "loading" && (
          <p role="status">Loading projects…</p>
        )}
        {visible?.status === "loaded" && (
          <div
            style={{ height: "100%", display: "grid", placeItems: "center" }}
          >
            {selected ? (
              <ProjectCanvas key={`${identity}:${selected.id}`} />
            ) : projectId ? (
              <EmptyState heading="Project unavailable">
                <Button slot="action" onClick={() => router.replace("/editor")}>
                  Return to editor
                </Button>
              </EmptyState>
            ) : (
              <EmptyState heading="No project selected">
                <Button slot="action" onClick={() => openDialog("create")}>
                  <Icon name="plus" size="sm" />
                  Create Project
                </Button>
              </EmptyState>
            )}
          </div>
        )}
        <Dialog
          ref={projectDialog}
          open={!!dialog && !!visible}
          mode={dialog?.mode ?? "create"}
          project={visible ? (dialog?.project ?? null) : null}
          projects={projects}
          storageError={message}
          validationError={validationError}
          pending={pending}
          blocked={visible?.status === "error"}
          onproject-retry={() => {
            setMessage("");
            void load(identity, true);
          }}
          onproject-cancel={() => {
            if (!submitting.current) {
              setDialog(null);
              setMessage("");
            }
          }}
          onproject-submit={submit}
        />
      </main>
    </div>
  );
}
