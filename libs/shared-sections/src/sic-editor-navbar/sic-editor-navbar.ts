import { LitElement, css, html } from 'lit';
import '@nx-learning/shared-ui';

export class SicEditorNavbar extends LitElement {
  static override properties = { sidebarOpen: { type: Boolean } };
  static override styles = css`
    :host { display: block; }
    uic-nav { box-sizing: border-box; height: var(--nav-height); }
  `;

  declare sidebarOpen: boolean;

  constructor() {
    super();
    this.sidebarOpen = false;
  }

  private toggleSidebar() {
    this.dispatchEvent(new CustomEvent('sidebar-toggle', {
      bubbles: true,
      composed: true,
    }));
  }

  protected override render() {
    const icon = this.sidebarOpen ? 'panel-left-close' : 'panel-left-open';
    const label = this.sidebarOpen ? 'Close projects sidebar' : 'Open projects sidebar';

    return html`
      <uic-nav>
        <uic-icon-button
          slot="left"
          .icon=${icon}
          .label=${label}
          .expanded=${this.sidebarOpen}
          @click=${this.toggleSidebar}
        ></uic-icon-button>
        <slot name="right" slot="right"></slot>
      </uic-nav>
    `;
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('sic-editor-navbar')) {
  customElements.define('sic-editor-navbar', SicEditorNavbar);
}
