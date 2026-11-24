import { LitElement, html, css } from "lit";
export class UicCard extends LitElement { static override styles=css`:host{display:block;background:var(--bg-surface);border:var(--border-width) solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-4);box-sizing:border-box}`; protected override render(){return html`<slot></slot>`;} }
if(typeof customElements!=="undefined"&&!customElements.get("uic-card"))customElements.define("uic-card",UicCard);
