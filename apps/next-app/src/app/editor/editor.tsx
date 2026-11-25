"use client";
import { useEffect, useRef, useState } from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { SidebarTab } from "@nx-learning/shared-sections";

// React needs types for these shared Lit custom elements and their events.
type ElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
const Navbar = "sic-editor-navbar" as React.ElementType<
  ElementProps & { sidebarOpen?: boolean; "onsidebar-toggle"?: () => void }
>;
const Sidebar = "sic-sidebar" as React.ElementType<
  ElementProps & {
    isOpen?: boolean;
    activeTab?: SidebarTab;
    "onsidebar-close"?: () => void;
    "ontab-change"?: (event: CustomEvent<{ value: SidebarTab }>) => void;
  }
>;

export default function Editor() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/sign-in");
  }, [isLoaded, isSignedIn, router]);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>("mine");
  const navbar = useRef<HTMLElement>(null);

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
          isOpen={sidebarOpen}
          activeTab={activeTab}
          onsidebar-close={closeSidebar}
          ontab-change={(event: CustomEvent<{ value: SidebarTab }>) =>
            setActiveTab(event.detail.value)
          }
        />
      </main>
    </div>
  );
}
