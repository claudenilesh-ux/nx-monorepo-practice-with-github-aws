import { Component } from '@angular/core';
import { Route } from '@angular/router';
import { Editor } from './editor/editor';
import { ClerkPage } from './clerk/clerk-page';
import { redirectHome, requireSession } from './clerk/clerk-guard';

@Component({ template: '<p>Authentication is unavailable. Check configuration and retry.</p>' })
class Unavailable {}

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', canActivate: [redirectHome], component: Unavailable },
  { path: 'sign-in', children: [{ path: '**', component: ClerkPage, data: { mode: 'sign-in' } }] },
  { path: 'sign-up', children: [{ path: '**', component: ClerkPage, data: { mode: 'sign-up' } }] },
  { path: 'unavailable', component: Unavailable },
  { path: 'editor', component: Editor, canActivate: [requireSession] },
  { path: '**', component: Editor, canActivate: [requireSession] },
];
