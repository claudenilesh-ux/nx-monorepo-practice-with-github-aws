import { LitElement, html, css } from "lit";
export class UicEmptyState extends LitElement {
  static override properties = {
    heading: { type: String },
    description: { type: String },
  };
  static override styles = css`
    :host {
      display: grid;
      place-items: center;
      text-align: center;
      padding: var(--space-8);
      color: var(--text-muted);
    }
    h2 {
      color: var(--text-primary);
      font-size: var(--font-size-lg);
      margin: 0 0 var(--space-2);
    }
    p {
      margin: 0 0 var(--space-4);
    }
  `;
  declare heading: string;
  declare description: string;
  protected override render() {
    return html`<section>
      <h2>${this.heading}</h2>
      <p>${this.description}</p>
      <slot name="action"></slot>
    </section>`;
  }
}
if (
  typeof customElements !== "undefined" &&
  !customElements.get("uic-empty-state")
)
  customElements.define("uic-empty-state", UicEmptyState);
