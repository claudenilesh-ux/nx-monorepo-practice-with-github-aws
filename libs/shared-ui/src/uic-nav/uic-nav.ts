import { LitElement, html, css } from "lit";
export class UicNav extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: var(--nav-height);
      padding: 0 var(--space-4);
      border-bottom: var(--border-width) solid var(--border-default);
      background: var(--bg-surface);
    }
    ::slotted([slot="left"]),
    ::slotted([slot="right"]) {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
  `;
  protected override render() {
    return html`<slot name="left"></slot><slot name="center"></slot
      ><slot name="right"></slot>`;
  }
}
if (typeof customElements !== "undefined" && !customElements.get("uic-nav"))
  customElements.define("uic-nav", UicNav);
