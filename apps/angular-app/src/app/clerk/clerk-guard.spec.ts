import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { requireSession } from './clerk-guard';
import { ClerkSession } from './clerk-session';

jest.mock('./clerk-session', () => ({ ClerkSession: class ClerkSession {} }));

describe('Editor route guard', () => {
  const initialize = jest.fn();
  const tree = { kind: 'redirect' };
  const createUrlTree = jest.fn(() => tree);
  beforeEach(() => {
    initialize.mockReset();
    createUrlTree.mockClear();
    TestBed.configureTestingModule({ providers: [
      { provide: ClerkSession, useValue: { initialize } },
      { provide: Router, useValue: { createUrlTree } },
    ] });
  });
  const runGuard = () => TestBed.runInInjectionContext(() => requireSession(
    {} as ActivatedRouteSnapshot, { url: '/editor?project=1' } as RouterStateSnapshot,
  ));
  it('redirects signed-out users to sign-in with their destination', async () => {
    initialize.mockResolvedValue({ user: null });
    expect(await runGuard()).toBe(tree);
    expect(createUrlTree).toHaveBeenCalledWith(['/sign-in'], { queryParams: { redirect_url: '/editor?project=1' } });
  });
  it('allows signed-in users', async () => {
    initialize.mockResolvedValue({ user: {} });
    expect(await runGuard()).toBe(true);
  });
  it('fails closed when initialization fails', async () => {
    initialize.mockRejectedValue(new Error('unavailable'));
    expect(await runGuard()).toBe(tree);
    expect(createUrlTree).toHaveBeenCalledWith(['/unavailable']);
  });
});
