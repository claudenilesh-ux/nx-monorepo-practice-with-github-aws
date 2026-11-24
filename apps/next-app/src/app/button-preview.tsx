"use client";

import { useEffect, useState } from "react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "uic-button": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        variant?: "primary" | "secondary";
        disabled?: boolean;
      };
    }
  }
}

export default function ButtonPreview() {
  const [ready, setReady] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    import("@nx-learning/shared-ui")
      .then(() => customElements.whenDefined("uic-button"))
      .then(() => setReady(true))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return <p>Unable to load shared UI.</p>;
  }

  if (!ready) {
    return <p>Loading shared UI...</p>;
  }

  return (
    <>
      <div className="actions">
        <uic-button
          variant="primary"
          onClick={() => setClickCount((count) => count + 1)}
        >
          + New Project
        </uic-button>

        <uic-button variant="secondary" onClick={() => setClickCount(0)}>
          Reset
        </uic-button>

        <uic-button disabled>Disabled</uic-button>
      </div>

      <p>Button clicks: {clickCount}</p>
    </>
  );
}
