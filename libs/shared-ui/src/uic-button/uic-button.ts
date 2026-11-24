import { LitElement, html } from "lit";
import { uicButtonStyles } from "./uic-button.styles";

export type ButtonVariant = "primary" | "secondary";

export class UicButton extends LitElement {
  static override properties = {
    variant: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, reflect: true, attribute: 'full-width' },
  };

  static override styles = uicButtonStyles;

  declare variant: ButtonVariant;
  declare disabled: boolean;

  constructor() {
    super();

    this.variant = "primary";
    this.disabled = false;
  }

  protected override render() {
    return html`
      <button
        type="button"
        class=${this.variant === "secondary" ? "secondary" : "primary"}
        ?disabled=${this.disabled}
      >
        <slot></slot>
      </button>
    `;
  }
}

if (typeof customElements !== "undefined" && !customElements.get("uic-button")) {
  customElements.define("uic-button", UicButton);
}

declare global {
  interface HTMLElementTagNameMap {
    "uic-button": UicButton;
  }
}
