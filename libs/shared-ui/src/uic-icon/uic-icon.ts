import { LitElement, html, css, type TemplateResult } from "lit";
import { createElement, Plus, X, Pencil, Trash2, Menu, User, Folder, Save, Upload, Link, Sparkles, Check, ChevronDown, PanelLeftOpen, PanelLeftClose, Server, Zap, Container, Database, Table, Network, GitBranch, Globe, Archive, Monitor } from "lucide";

export type IconName = "plus" | "x" | "pencil" | "trash-2" | "menu" | "user" | "folder" | "save" | "upload" | "link" | "sparkles" | "check" | "chevron-down" | "panel-left-open" | "panel-left-close" | "server" | "zap" | "container" | "database" | "table" | "network" | "git-branch" | "globe" | "archive" | "monitor";
const icons = { plus: Plus, x: X, pencil: Pencil, "trash-2": Trash2, menu: Menu, user: User, folder: Folder, save: Save, upload: Upload, link: Link, sparkles: Sparkles, check: Check, "chevron-down": ChevronDown, "panel-left-open": PanelLeftOpen, "panel-left-close": PanelLeftClose, server: Server, zap: Zap, container: Container, database: Database, table: Table, network: Network, "git-branch": GitBranch, globe: Globe, archive: Archive, monitor: Monitor } as const;

export class UicIcon extends LitElement {
  static override properties = { name: { type: String }, size: { type: String } };
  static override styles = css`:host{display:inline-flex;line-height:0;color:inherit}svg{width:var(--icon-md);height:var(--icon-md);stroke:currentColor;stroke-width:2;fill:none}.sm svg{width:var(--icon-sm);height:var(--icon-sm)}`;
  declare name: IconName; declare size: "sm" | "md";
  constructor(){ super(); this.size="md"; }
  protected override render(): TemplateResult { const icon = icons[this.name]; return html`<span class=${this.size === "sm" ? "sm" : ""} aria-hidden="true">${icon && typeof document !== "undefined" ? createElement(icon) : ""}</span>`; }
}
if(typeof customElements !== "undefined" && !customElements.get("uic-icon")) customElements.define("uic-icon", UicIcon);
declare global { interface HTMLElementTagNameMap { "uic-icon": UicIcon } }
