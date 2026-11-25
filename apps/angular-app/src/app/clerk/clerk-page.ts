import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClerkSession } from './clerk-session';

@Component({
  selector: 'app-clerk-page',
  template: `<main class="auth-layout"><section class="intro"><strong>Nx Learning</strong><h1>Project workspace</h1><p>Organize your projects in one place.</p><ul><li>Navigate projects</li><li>Work in a shared workspace</li></ul></section><section class="form"><div #host></div>@if (failed) { <p>Authentication is unavailable. Check configuration and retry.</p> }</section></main>`,
  styles: [`.auth-layout{min-height:100dvh;display:grid;grid-template-columns:1fr 1fr}.intro{padding:var(--space-8);background:var(--bg-surface);border-right:var(--border-width) solid var(--border-default)}.form{display:flex;align-items:center;justify-content:center;padding:var(--space-5)}@media(max-width:767px){.auth-layout{display:block}.intro{display:none}.form{min-height:100dvh}}`],
})
export class ClerkPage implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLDivElement>;
  private session = inject(ClerkSession);
  private changes = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private destroyed = false;
  failed = false;
  private get isSignUp() { return this.route.snapshot.data['mode'] === 'sign-up'; }
  async ngAfterViewInit() {
    try {
      const clerk = await this.session.initialize();
      if (this.destroyed) return;
      if (this.isSignUp) clerk.mountSignUp(this.host.nativeElement, { routing: 'path', path: '/sign-up' });
      else clerk.mountSignIn(this.host.nativeElement, { routing: 'path', path: '/sign-in' });
    } catch { this.failed = true; this.changes.markForCheck(); }
  }
  ngOnDestroy() {
    this.destroyed = true;
    const clerk = this.session.clerk;
    if (clerk) {
      if (this.isSignUp) clerk.unmountSignUp(this.host.nativeElement);
      else clerk.unmountSignIn(this.host.nativeElement);
    }
  }
}
