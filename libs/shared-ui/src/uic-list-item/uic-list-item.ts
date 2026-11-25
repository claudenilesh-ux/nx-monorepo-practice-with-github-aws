import { LitElement, html, css } from 'lit';
import '../uic-icon-button/uic-icon-button';

export class UicListItem extends LitElement {
  static override properties = { label: { type: String }, secondary: { type: String }, selected: { type: Boolean, reflect: true } };
  static override styles = css`
    :host { display:flex; align-items:center; gap:var(--space-2); padding:var(--space-2) var(--space-3); border-radius:var(--radius-md); color:var(--text-primary) }
    :host([selected]) { background:var(--bg-hover) }
    .label { flex:1; min-width:0; text-align:left; border:0; background:transparent; color:inherit; cursor:pointer; font:inherit }
    .label:focus-visible { outline:var(--focus-width) solid var(--focus-ring) }
    .secondary { display:block; color:var(--text-muted); font-size:var(--font-size-sm); overflow-wrap:anywhere }
  `;
  declare label: string;
  declare secondary: string;
  declare selected: boolean;
  private emit(name: string) { this.dispatchEvent(new CustomEvent(name, { detail: { id: this.label }, bubbles: true, composed: true })); }
  protected override render() {
    return html`<button type="button" class="label" @click=${() => this.emit('uic-select')}>${this.label}${this.secondary ? html`<span class="secondary">${this.secondary}</span>` : ''}</button><uic-icon-button icon="pencil" label=${`Edit ${this.label}`} @click=${() => this.emit('uic-edit')}></uic-icon-button><uic-icon-button icon="trash-2" label=${`Delete ${this.label}`} @click=${() => this.emit('uic-delete')}></uic-icon-button>`;
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('uic-list-item')) customElements.define('uic-list-item', UicListItem);
