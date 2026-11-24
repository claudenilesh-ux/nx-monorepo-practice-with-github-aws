import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from "@angular/core";
import "@nx-learning/shared-sections";
import type { SidebarTab } from "@nx-learning/shared-sections";

@Component({
  selector: "app-editor",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<div class="editor">
    <sic-editor-navbar
      #navbar
      [sidebarOpen]="sidebarOpen"
      (sidebar-toggle)="sidebarOpen = !sidebarOpen"
    ></sic-editor-navbar>
    <main class="workspace">
      <sic-sidebar
        [isOpen]="sidebarOpen"
        [activeTab]="activeTab"
        (sidebar-close)="closeSidebar()"
        (tab-change)="changeTab($event)"
      ></sic-sidebar>
    </main>
  </div>`,
  styles: [
    `
      .editor {
        height: 100dvh;
        display: flex;
        flex-direction: column;
      }
      .workspace {
        position: relative;
        flex: 1;
        min-height: 0;
        background: var(--bg-base);
      }
    `,
  ],
})
export class Editor {
  @ViewChild("navbar", { read: ElementRef }) navbar?: ElementRef<HTMLElement>;
  sidebarOpen = typeof window !== "undefined" && window.innerWidth >= 768;
  activeTab: SidebarTab = "mine";
  changeTab(event: Event) {
    const tabChange = event as CustomEvent<{ value: SidebarTab }>;
    this.activeTab = tabChange.detail.value;
  }
  closeSidebar() {
    this.sidebarOpen = false;
    // Return keyboard focus to the button that opens the sidebar.
    const control =
      this.navbar?.nativeElement.shadowRoot?.querySelector("uic-icon-button");
    control?.shadowRoot?.querySelector("button")?.focus();
  }
}
