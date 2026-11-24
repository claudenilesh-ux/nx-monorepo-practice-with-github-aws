import { LitElement, css, html } from 'lit';
import '@nx-learning/shared-ui';

export type SidebarTab = 'mine' | 'shared';

export class SicSidebar extends LitElement {
  static override properties = {
    isOpen: { type: Boolean },
    activeTab: { type: String },
  };

  static override styles = css`
    :host {
      position: absolute;
      inset: 0 auto 0 0;
      width: min(var(--sidebar-width), 100%);
      pointer-events: none;
      z-index: 1;
    }
    aside {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: var(--bg-surface);
      border: var(--border-width) solid var(--border-default);
      border-radius: var(--radius-lg);
      transform: translateX(-100%);
      transition: transform var(--motion-sidebar) ease;
      pointer-events: none;
      overflow: hidden;
    }
    aside.open { transform: translateX(0); pointer-events: auto; }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
    }
    h2 { font-size: var(--font-size-lg); margin: 0; }
    uic-tabs {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      padding: 0 var(--space-3);
    }
    uic-scroll-area { height: 100%; min-height: 0; }
    uic-empty-state { padding: var(--space-4); }
    footer { padding: var(--space-4); }
    @media (prefers-reduced-motion: reduce) {
      aside { transition: none; }
    }
  `;

  declare isOpen: boolean;
  declare activeTab: SidebarTab;

  private readonly items = [
    { id: 'mine', label: 'My Projects' },
    { id: 'shared', label: 'Shared' },
  ];

  constructor() {
    super();
    this.isOpen = false;
    this.activeTab = 'mine';
  }

  private emit(name: string) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  private tabChange(event: CustomEvent<{ value: SidebarTab }>) {
    event.stopPropagation();
    this.dispatchEvent(new CustomEvent('tab-change', {
      detail: event.detail,
      bubbles: true,
      composed: true,
    }));
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.emit('sidebar-close');
    }
  }

  protected override render() {
    return html`
      <aside
        class=${this.isOpen ? 'open' : ''}
        ?inert=${!this.isOpen}
        aria-hidden=${!this.isOpen}
        @keydown=${this.handleKeydown}
      >
        <header>
          <h2>Projects</h2>
          <uic-icon-button
            icon="x"
            label="Close projects sidebar"
            @click=${() => this.emit('sidebar-close')}
          ></uic-icon-button>
        </header>

        <uic-tabs
          .items=${this.items}
          .value=${this.activeTab}
          panels
          @uic-change=${this.tabChange}
        >
          <uic-scroll-area slot="panel-mine">
            <uic-empty-state heading="No projects yet"></uic-empty-state>
          </uic-scroll-area>
          <uic-scroll-area slot="panel-shared">
            <uic-empty-state heading="No shared projects yet"></uic-empty-state>
          </uic-scroll-area>
        </uic-tabs>

        <footer>
          <uic-button full-width @click=${() => this.emit('project-create')}>
            <uic-icon name="plus" size="sm"></uic-icon>
            New Project
          </uic-button>
        </footer>
      </aside>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('sic-sidebar')) {
  customElements.define('sic-sidebar', SicSidebar);
}
