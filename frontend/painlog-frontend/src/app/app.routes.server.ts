import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'register', renderMode: RenderMode.Client },
  { path: 'homepage', renderMode: RenderMode.Server },
  { path: 'newentry', renderMode: RenderMode.Server },
  { path: 'edit-entry/:id', renderMode: RenderMode.Server },
  { path: 'reportspage', renderMode: RenderMode.Server },
  { path: 'details-page/:id', renderMode: RenderMode.Server },
  { path: 'statistics', renderMode: RenderMode.Server },
  { path: 'resourcespage', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server }
];