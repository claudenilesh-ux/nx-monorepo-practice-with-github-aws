import { LitElement, html, css } from "lit";
export class UicScrollArea extends LitElement { static override styles=css`:host{display:block;overflow-y:auto;max-height:100%;outline:none}:host(:focus-visible){outline:var(--focus-width) solid var(--focus-ring)}`; protected override render(){return html`<slot></slot>`;} }
if(typeof customElements!=="undefined"&&!customElements.get("uic-scroll-area"))customElements.define("uic-scroll-area",UicScrollArea);
