import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ClerkSession } from './clerk-session';

export const requireSession: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  try {
    const clerk = await inject(ClerkSession).initialize();
    return clerk.user ? true : router.createUrlTree(['/sign-in'], { queryParams: { redirect_url: state.url } });
  } catch {
    return router.createUrlTree(['/unavailable']);
  }
};

export const redirectHome: CanActivateFn = async () => {
  const router = inject(Router);
  try {
    const clerk = await inject(ClerkSession).initialize();
    return router.parseUrl(clerk.user ? '/editor' : '/sign-in');
  } catch {
    return router.parseUrl('/unavailable');
  }
};
