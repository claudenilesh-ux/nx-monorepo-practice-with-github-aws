import { LitElement, css, html } from 'lit';
import '@nx-learning/shared-ui';
import { validateProjectName, type Project } from '@nx-learning/project-data';

export class SicProjectDialog extends LitElement {
  static override properties = { open: { type: Boolean }, mode: { type: String }, project: { attribute: false }, projects: { attribute: false }, storageError: { type: String }, validationError: { type: String }, pending: { type: Boolean }, blocked: { type: Boolean }, name: { state: true }, touched: { state: true } };
  static override styles = css`p { color:var(--text-muted); } .slug { margin:var(--space-4) 0; overflow-wrap:anywhere; }`;
  declare open: boolean;
  declare mode: 'create' | 'rename' | 'delete';
  declare project: Project | null;
  declare projects: Project[];
  declare name: string;
  declare storageError: string;
  declare validationError: string;
  declare touched: boolean;
  declare pending: boolean;
  declare blocked: boolean;
  constructor() { super(); this.open = false; this.mode = 'create'; this.project = null; this.projects = []; this.name = ''; this.storageError = ''; this.validationError = ''; this.touched = false; this.pending = false; this.blocked = false; }
  protected override willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('open') && this.open) { this.name = this.project?.name ?? ''; this.touched = false; }
  }
  private emit(name: string, detail?: unknown) { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }
  private submit() {
    if (this.pending || this.blocked) return;
    if (this.mode === 'delete') { this.emit('project-submit'); return; }
    const result = validateProjectName(this.name, this.projects, this.project?.id);
    if (!result.error) this.emit('project-submit', { name: result.name, slug: result.slug });
  }
  protected override render() {
    const result = validateProjectName(this.name, this.projects, this.project?.id);
    const heading = this.mode === 'create' ? 'Create Project' : this.mode === 'rename' ? 'Rename Project' : 'Delete Project';
    return html`<uic-modal .open=${this.open} .heading=${heading} .busy=${this.pending} @uic-close=${() => this.emit('project-cancel')}>
      ${this.mode === 'delete' ? html`<p slot="description">Delete ${this.project?.name}? This action cannot be undone.</p>` : html`
        <uic-input ?disabled=${this.pending} label="Project Name" .value=${this.name} .error=${this.validationError || (this.touched ? result.error ?? '' : '')} @uic-change=${(event: CustomEvent<{value: string}>) => { event.stopPropagation(); this.name = event.detail.value; this.validationError = ''; this.touched = true; }} @keydown=${(event: KeyboardEvent) => { if (event.key === 'Enter') { event.preventDefault(); this.submit(); } }}></uic-input>
        <p class="slug">Project Slug: ${result.slug ?? ''}</p>`}
      ${this.pending ? html`<p role="status">Saving…</p>` : ""}
      ${this.blocked ? html`<uic-button @click=${() => this.emit('project-retry')}>Retry loading projects</uic-button>` : ""}
      ${this.storageError ? html`<p role="alert">${this.storageError}</p>` : ""}
      <uic-button slot="footer" ?disabled=${this.pending} variant="secondary" @click=${() => this.emit('project-cancel')}>Cancel</uic-button>
      <uic-button slot="footer" variant=${this.mode === 'delete' ? 'destructive' : 'primary'} ?disabled=${this.pending || this.blocked || (this.mode !== 'delete' && !!result.error)} @click=${this.submit}>${this.mode === 'create' ? 'Create' : this.mode === 'rename' ? 'Save' : 'Delete'}</uic-button>
    </uic-modal>`;
  }
}
if (typeof customElements !== 'undefined' && !customElements.get('sic-project-dialog')) customElements.define('sic-project-dialog', SicProjectDialog);
