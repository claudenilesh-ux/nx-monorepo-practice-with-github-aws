import { LitElement, html, css, nothing } from 'lit';

export class UicModal extends LitElement {
  static override properties = { heading: { type: String }, open: { type: Boolean, reflect: true }, busy: { type: Boolean } };
  static override styles = css`dialog{box-sizing:border-box;border:var(--border-width) solid var(--border-default);border-radius:var(--radius-lg);background:var(--bg-surface);color:var(--text-primary);padding:var(--space-5);min-width:min(420px,calc(100vw - var(--space-6)))}dialog::backdrop{background:var(--bg-overlay)}header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4)}footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}button{background:transparent;border:0;color:var(--text-primary);cursor:pointer}`;
  declare heading: string;
  declare open: boolean;
  declare busy: boolean;
  private lastFocus?: HTMLElement;

  protected override updated() {
    const dialog = this.renderRoot.querySelector('dialog');
    if (!dialog) return;
    if (this.open && !dialog.open) { this.lastFocus = document.activeElement as HTMLElement; dialog.showModal(); }
    else if (!this.open && dialog.open) dialog.close();
  }
  private close() { if (this.busy) return; this.open = false; this.dispatchEvent(new CustomEvent('uic-close', { bubbles: true, composed: true })); }
  protected override render() {
    const hasDescription = !!this.querySelector('[slot="description"]');
    return html`<dialog aria-busy=${this.busy ? "true" : "false"} aria-labelledby="dialog-title" aria-describedby=${hasDescription ? 'dialog-description' : nothing} @cancel=${(event: Event) => { event.preventDefault(); this.close(); }} @close=${() => this.lastFocus?.focus()}><header><h2 id="dialog-title">${this.heading}</h2><button type="button" ?disabled=${this.busy} aria-label="Close" @click=${this.close}>×</button></header><div id="dialog-description"><slot name="description" @slotchange=${() => this.requestUpdate()}></slot></div><slot></slot><footer><slot name="footer"></slot></footer></dialog>`;
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('uic-modal')) customElements.define('uic-modal', UicModal);
