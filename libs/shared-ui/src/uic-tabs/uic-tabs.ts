import { LitElement, html, css, nothing } from 'lit';

export interface TabItem { id: string; label: string }

export class UicTabs extends LitElement {
  static override properties = { items: { attribute: false }, value: { type: String }, panels: { type: Boolean } };
  static override styles = css`:host{display:block}:host([panels]){display:flex;flex-direction:column}.tabs{display:flex;gap:var(--space-2);border-bottom:var(--border-width) solid var(--border-default)}[role=tabpanel]:not([hidden]){flex:1;min-height:0;overflow-y:auto}button{border:0;background:transparent;color:var(--text-muted);padding:var(--space-3);cursor:pointer}button[aria-selected=true]{color:var(--text-primary);border-bottom:var(--focus-width) solid var(--accent-primary)}button:focus-visible{outline:var(--focus-width) solid var(--focus-ring)}`;
  declare items: TabItem[];
  declare value: string;
  declare panels: boolean;

  private select(id: string) {
    this.value = id;
    this.dispatchEvent(new CustomEvent('uic-change', { detail: { value: id }, bubbles: true, composed: true }));
  }

  private key(event: KeyboardEvent) {
    const items = this.items ?? [];
    if (!items.length) return;
    const index = items.findIndex(item => item.id === this.value);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length : -1;
    if (next >= 0) {
      event.preventDefault();
      this.select(items[next].id);
      this.renderRoot.querySelectorAll('button')[next]?.focus();
    }
  }

  protected override render() {
    const items = this.items ?? [];
    const selected = items.some(item => item.id === this.value) ? this.value : items[0]?.id;
    return html`<div class="tabs" role="tablist" @keydown=${this.key}>${items.map((item, index) => html`<button type="button" role="tab" id=${`tab-${index}`} aria-controls=${this.panels ? `panel-${index}` : nothing} aria-selected=${item.id === selected} tabindex=${item.id === selected ? 0 : -1} @click=${() => this.select(item.id)}>${item.label}</button>`)}</div>${this.panels ? items.map((item, index) => html`<div role="tabpanel" id=${`panel-${index}`} aria-labelledby=${`tab-${index}`} ?hidden=${item.id !== selected}><slot name=${`panel-${item.id}`}></slot></div>`) : nothing}`;
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('uic-tabs')) customElements.define('uic-tabs', UicTabs);
