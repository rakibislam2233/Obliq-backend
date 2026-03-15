import { Router } from 'express';
import { UserRoutes } from '../../modules/users/users.routes';
const router = Router();

// Module routes
const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
