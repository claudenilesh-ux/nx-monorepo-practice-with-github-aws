import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  AfterViewInit, OnDestroy, inject,
} from "@angular/core";
import "@nx-learning/shared-sections";
import { ClerkSession } from "../clerk/clerk-session";
import type { SidebarTab } from "@nx-learning/shared-sections";

@Component({
  selector: "app-editor",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<div class="editor">
    <sic-editor-navbar
      #navbar
      [sidebarOpen]="sidebarOpen"
      (sidebar-toggle)="sidebarOpen = !sidebarOpen"
    ><div slot="right" #userButton></div></sic-editor-navbar>
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
export class Editor implements AfterViewInit, OnDestroy {
  @ViewChild("userButton", { static: true }) userButton!: ElementRef<HTMLDivElement>;
  private session = inject(ClerkSession);
  private destroyed = false;
  async ngAfterViewInit() {
    const clerk = await this.session.initialize();
    if (!this.destroyed) clerk.mountUserButton(this.userButton.nativeElement);
  }
  ngOnDestroy() {
    this.destroyed = true;
    this.session.clerk?.unmountUserButton(this.userButton.nativeElement);
  }
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
