import { Router } from 'express';
const router = Router();

// Module routes
const moduleRoutes = [
  {
    path: '/users',
    route: "./users.route",
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
