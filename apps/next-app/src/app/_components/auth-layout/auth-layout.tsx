import type { ReactNode } from "react";
import "./auth-layout.scss";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-intro" aria-label="About the workspace">
        <div className="auth-brand"><span className="auth-brand-mark" aria-hidden="true" />Archloom</div>
        <div className="auth-intro-content">
          <h1>From ideas to architecture.</h1>
          <p className="auth-intro-description">A visual workspace for designing the software systems of tomorrow.</p>
          <ul className="auth-features">
            <li><span className="auth-feature-mark" aria-hidden="true">▦</span><div><h2>Organise your projects</h2><p>Manage your architecture projects in one workspace.</p></div></li>
            <li><span className="auth-feature-mark" aria-hidden="true">✎</span><div><h2>Make it your own</h2><p>Create and refine your project ideas.</p></div></li>
            <li><span className="auth-feature-mark" aria-hidden="true">▣</span><div><h2>Continue where you left off</h2><p>Your projects are saved in this browser.</p></div></li>
          </ul>
        </div>
        <footer className="auth-footer">Archloom · Design with clarity.</footer>
      </section>
      <section className="auth-form" aria-label="Account access">{children}</section>
    </main>
  );
}
