import { css } from "lit";

export const uicButtonStyles = css`
  :host {
    display: inline-block;
  }
  :host([full-width]), :host([full-width]) button { width: 100%; }

  button {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: var(--control-height);
    padding: var(--space-2) var(--space-4);
    gap: var(--space-2);

    font-family: var(--font-sans);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);

    border: var(--border-width) solid transparent;
    border-radius: var(--radius-md);

    cursor: pointer;
  }

  button.primary {
    background: var(--accent-primary);
    color: var(--text-on-accent);
  }

  button.primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  button.secondary {
    background: var(--bg-surface);
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  button.secondary:hover:not(:disabled) {
    background: var(--bg-hover);
  }

  button:focus-visible {
    outline: var(--focus-width) solid var(--focus-ring);
    outline-offset: var(--space-1);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
