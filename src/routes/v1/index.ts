import { Router } from 'express';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import { UserRoutes } from '../../modules/users/users.routes';
import { AuditRoutes } from '../../modules/auditLogs/auditLogs.routes';
const router = Router();

// Module routes
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/audit-logs',
    route: AuditRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
