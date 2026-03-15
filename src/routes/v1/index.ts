import { Router } from 'express';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import { RoleRoutes } from '../../modules/roles/roles.routes';
import { UserRoutes } from '../../modules/users/users.routes';
import { AuditRoutes } from '../../modules/auditLogs/auditLogs.routes';
import { PermissionRoutes } from '../../modules/permissions/permissions.routes';
import { LeadRoutes } from '../../modules/leads/leads.routes';
import { TaskRoutes } from '../../modules/tasks/tasks.routes';
const router = Router();

// Module routes
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/roles',
    route: RoleRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/audit-logs',
    route: AuditRoutes,
  },
  {
    path: '/permissions',
    route: PermissionRoutes,
  },
  {
    path: '/leads',
    route: LeadRoutes,
  },
  {
    path: '/tasks',
    route: TaskRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
