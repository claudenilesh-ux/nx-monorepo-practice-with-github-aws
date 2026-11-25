import type { ReactNode } from 'react';
import './auth-layout.scss';
export function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-layout"><section className="auth-intro"><strong>Nx Learning</strong><h1>Project workspace</h1><p>Organize your projects in one place.</p><ul><li>Navigate projects</li><li>Work in a shared workspace</li></ul></section><section className="auth-form">{children}</section></main>;
}
