import { LitElement, css, html } from "lit";
import "../uic-avatar/uic-avatar";
import "../uic-button/uic-button";
import "../uic-card/uic-card";

export class UicProfile extends LitElement {
  static override properties = {
    name: { type: String },
    email: { type: String },
    imageUrl: { type: String },
    open: { state: true },
  };
  static override styles = css`
    :host {
      display: inline-block;
      position: relative;
    }
    .trigger {
      display: flex;
      padding: 0;
      border: 0;
      border-radius: var(--radius-full);
      background: transparent;
      cursor: pointer;
    }
    .trigger:focus-visible {
      outline: var(--focus-width) solid var(--focus-ring);
    }
    uic-card {
      position: absolute;
      right: 0;
      top: calc(100% + var(--space-2));
      z-index: 1;
      width: min(320px, calc(100vw - var(--space-4)));
      color: var(--text-primary);
    }
    .details {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .identity {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .email {
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }
  `;
  declare name: string;
  declare email: string;
  declare imageUrl: string;
  declare private open: boolean;

  constructor() {
    super();
    this.name = "";
    this.email = "";
    this.imageUrl = "";
    this.open = false;
  }

  private close() {
    this.open = false;
    this.updateComplete.then(() =>
      this.renderRoot.querySelector<HTMLButtonElement>(".trigger")?.focus(),
    );
  }

  protected override render() {
    return html`
      <button
        class="trigger"
        aria-label="Open profile"
        aria-expanded=${this.open}
        @click=${() => {
          this.open = !this.open;
        }}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === "Escape" && this.open) this.close();
        }}
      >
        <uic-avatar
          .src=${this.imageUrl}
          .label=${this.name || "Profile"}
        ></uic-avatar>
      </button>
      ${this.open
        ? html` <uic-card
            @keydown=${(event: KeyboardEvent) => {
              if (event.key === "Escape") this.close();
            }}
          >
            <div class="details">
              <uic-avatar
                .src=${this.imageUrl}
                .label=${this.name || "Profile"}
              ></uic-avatar>
              <div class="identity">
                <div>${this.name}</div>
                <div class="email">${this.email}</div>
              </div>
            </div>
            <uic-button
              variant="secondary"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("profile-sign-out", {
                    bubbles: true,
                    composed: true,
                  }),
                )}
              >Sign out</uic-button
            >
          </uic-card>`
        : ""}
    `;
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("uic-profile")
) {
  customElements.define("uic-profile", UicProfile);
}
