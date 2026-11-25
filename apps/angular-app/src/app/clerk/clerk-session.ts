import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { Clerk } from '@clerk/clerk-js';
import { dark } from '@clerk/ui/themes';

@Injectable({ providedIn: 'root' })
export class ClerkSession {
  private router = inject(Router);
  private instance?: Clerk;
  private loading?: Promise<Clerk>;

  initialize(): Promise<Clerk> {
    if (!this.loading) this.loading = this.load();
    return this.loading;
  }

  private async load(): Promise<Clerk> {
    const key = document.querySelector<HTMLMetaElement>('meta[name="clerk-publishable-key"]')?.content;
    if (!key) throw new Error('Clerk publishable key is not configured.');
    const [{ Clerk }, { ui }] = await Promise.all([import('@clerk/clerk-js'), import('@clerk/ui')]);
    const clerk = new Clerk(key);
    await clerk.load({
      ui: { ClerkUI: ui.ClerkUI },
      signInUrl: '/sign-in', signUpUrl: '/sign-up', afterSignOutUrl: '/',
      signInFallbackRedirectUrl: '/editor', signUpFallbackRedirectUrl: '/editor',
      appearance: { theme: dark, variables: {
        colorPrimary: 'var(--accent-primary)', colorBackground: 'var(--bg-surface)',
        colorForeground: 'var(--text-primary)', colorMutedForeground: 'var(--text-muted)',
        colorInput: 'var(--bg-hover)', colorInputForeground: 'var(--text-primary)',
        colorBorder: 'var(--border-default)', colorDanger: 'var(--state-error)',
        fontFamily: 'var(--font-sans)', borderRadius: 'var(--radius-md)',
      } },
    });
    this.instance = clerk;
    clerk.addListener(({ user }) => {
      const url = this.router.url;
      if (!user && url !== '/' && !url.startsWith('/sign-in') && !url.startsWith('/sign-up') && !url.startsWith('/unavailable')) {
        void this.router.navigateByUrl('/sign-in');
      }
    });
    return clerk;
  }

  get clerk(): Clerk | undefined { return this.instance; }
}
