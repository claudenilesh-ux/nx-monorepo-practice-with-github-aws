import { Route } from '@angular/router';
import { App } from './app';
import { Editor } from './editor/editor';

export const appRoutes: Route[] = [
  { path: '', component: App, pathMatch: 'full' },
  { path: 'editor', component: Editor },
];
