import { LitElement, css, html } from 'lit';
import '@nx-learning/shared-ui';
import type { IconName } from '@nx-learning/shared-ui';

export type ComponentEntry = { readonly id: string; readonly label: string; readonly category: string; readonly icon: IconName; readonly aliases: readonly string[] };

export class SicComponentLibrary extends LitElement {
  static override properties = { entries: { attribute: false }, query: { state: true } };
  static override styles = css`
    :host { display: flex; flex-direction: column; box-sizing: border-box; height: 100%; background: var(--bg-surface); border-left: var(--border-width) solid var(--border-default); color: var(--text-primary); }
    header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); }
    h2, h3 { margin: 0; font-size: var(--font-size-md); }
    .search { padding: 0 var(--space-4) var(--space-4); }
    .clear { margin-top: var(--space-2); }
    uic-scroll-area { flex: 1; min-height: 0; padding: 0 var(--space-4) var(--space-4); }
    section { margin-bottom: var(--space-4); }
    h3 { color: var(--text-muted); margin-bottom: var(--space-2); }
    .tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); }
    uic-card { display: flex; min-width: 0; }
    .tile { display: flex; align-items: center; gap: var(--space-2); overflow-wrap: anywhere; }
    uic-icon { flex: none; color: var(--accent-primary); }
    uic-empty-state { padding: var(--space-4); }
  `;
  declare entries: readonly ComponentEntry[];
  private declare query: string;
  constructor() { super(); this.entries = []; this.query = ''; }
  protected override render() {
    const query = this.query.trim().toLowerCase();
    const matches = this.entries.filter(entry => [entry.label, entry.category, ...entry.aliases].some(value => value.toLowerCase().includes(query)));
    const categories = [...new Set(matches.map(entry => entry.category))];
    return html`
      <header><h2>Components</h2><uic-icon-button icon="x" label="Close components" @click=${() => this.dispatchEvent(new CustomEvent('component-library-close', { bubbles: true, composed: true }))}></uic-icon-button></header>
      <div class="search"><uic-input label="Search components" placeholder="Search components" .value=${this.query} @uic-change=${(event: CustomEvent<{ value: string }>) => { this.query = event.detail.value; }}></uic-input>
        ${this.query ? html`<uic-button class="clear" data-clear @click=${() => { this.query = ''; }}>Clear search</uic-button>` : ''}</div>
      <uic-scroll-area tabindex="0" aria-label="Component catalog">
        ${categories.length ? categories.map(category => html`<section><h3>${category}</h3><div class="tiles">${matches.filter(entry => entry.category === category).map(entry => html`<uic-card><div class="tile"><uic-icon .name=${entry.icon}></uic-icon><span>${entry.label}</span></div></uic-card>`)}</div></section>`) : html`<uic-empty-state heading="No components found" description="Try a different search term."></uic-empty-state>`}
      </uic-scroll-area>`;
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('sic-component-library')) customElements.define('sic-component-library', SicComponentLibrary);
declare global { interface HTMLElementTagNameMap { 'sic-component-library': SicComponentLibrary } }
