
import { Routes } from '@angular/router';
import { AppShellComponent } from './core/layout/app-shell.component';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard-page.component').then(m => m.DashboardPageComponent),
      },
      {
        path: 'websites',
        loadComponent: () => import('./features/websites/pages/website-list-page.component').then(m => m.WebsiteListPageComponent),
      },
      {
        path: 'websites/:id',
        loadComponent: () => import('./features/websites/pages/website-detail-page.component').then(m => m.WebsiteDetailPageComponent),
      },
       {
        path: 'builder/:id',
        loadComponent: () => import('./features/websites/website-detail-builder/pages/website-detail-builder-page.component').then(m => m.WebsiteDetailBuilderPageComponent),
      },
      {
        path: 'workflows',
        loadComponent: () => import('./features/workflow/workflow-builder.component').then(m => m.WorkflowBuilderComponent),
      },
      {
        path: 'deploy',
        loadComponent: () => import('./features/deploy/pages/deploy-page.component').then(m => m.DeployPageComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];