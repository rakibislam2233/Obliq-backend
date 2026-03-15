import bcrypt from 'bcryptjs';
import { RoleType } from '../../prisma/generated/enums';
import { database } from '../config/database.config';

async function main() {
  console.log('🌱 Seeding started...');

  // ============================================
  // STEP 1 —Create Roles
  // ============================================
  console.log('📌 Creating roles...');

  const roles = await Promise.all(
    Object.values(RoleType).map(name =>
      database.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const adminRole = roles.find(r => r.name === RoleType.ADMIN)!;
  const managerRole = roles.find(r => r.name === RoleType.MANAGER)!;
  const agentRole = roles.find(r => r.name === RoleType.AGENT)!;
  const customerRole = roles.find(r => r.name === RoleType.CUSTOMER)!;

  console.log('✅ Roles created');

  // ============================================
  // STEP 2 —Create Permission Atoms
  // ============================================
  console.log('📌 Creating permissions...');

  const permissionData = [
    // Dashboard
    { atom: 'view:dashboard', description: 'View dashboard', module: 'dashboard' },

    // Users
    { atom: 'view:users', description: 'View users list', module: 'users' },
    { atom: 'manage:users', description: 'Edit and update users', module: 'users' },
    { atom: 'create:users', description: 'Create new users', module: 'users' },
    { atom: 'delete:users', description: 'Delete users', module: 'users' },

    // Leads
    { atom: 'view:leads', description: 'View leads', module: 'leads' },
    { atom: 'manage:leads', description: 'Manage leads', module: 'leads' },
    { atom: 'create:leads', description: 'Create leads', module: 'leads' },
    { atom: 'delete:leads', description: 'Delete leads', module: 'leads' },

    // Opportunities
    { atom: 'view:opportunities', description: 'View opportunities', module: 'opportunities' },
    { atom: 'manage:opportunities', description: 'Manage opportunities', module: 'opportunities' },

    // Tasks
    { atom: 'view:tasks', description: 'View tasks', module: 'tasks' },
    { atom: 'manage:tasks', description: 'Manage tasks', module: 'tasks' },
    { atom: 'create:tasks', description: 'Create tasks', module: 'tasks' },
    { atom: 'delete:tasks', description: 'Delete tasks', module: 'tasks' },
    { atom: 'view:assignments', description: 'View assignments', module: 'tasks' },
    { atom: 'view:calendar', description: 'View calendar', module: 'tasks' },
    { atom: 'view:reminders', description: 'View reminders', module: 'tasks' },

    // Reports
    { atom: 'view:reports', description: 'View reports', module: 'reports' },
    { atom: 'export:reports', description: 'Export/download reports', module: 'reports' },

    // Messages
    { atom: 'view:messages', description: 'View messages', module: 'messages' },
    { atom: 'send:messages', description: 'Send messages', module: 'messages' },

    // Audit Log
    { atom: 'view:audit', description: 'View audit logs', module: 'audit' },

    // Customers
    { atom: 'view:customers', description: 'View customers', module: 'customers' },
    { atom: 'manage:customers', description: 'Manage customers', module: 'customers' },

    // Permissions
    {
      atom: 'manage:permissions',
      description: 'Grant or revoke permissions',
      module: 'permissions',
    },

    // Configuration
    { atom: 'view:configuration', description: 'View configuration', module: 'configuration' },
    { atom: 'manage:configuration', description: 'Manage configuration', module: 'configuration' },

    // Invoice
    { atom: 'view:invoice', description: 'View invoices', module: 'invoice' },
    { atom: 'manage:invoice', description: 'Manage invoices', module: 'invoice' },

    // Settings
    { atom: 'view:settings', description: 'View settings', module: 'settings' },
    { atom: 'manage:settings', description: 'Manage settings', module: 'settings' },
  ];

  const permissions = await Promise.all(
    permissionData.map(p =>
      database.permission.upsert({
        where: { atom: p.atom },
        update: {},
        create: p,
      })
    )
  );

  console.log(`✅ ${permissions.length} permissions created`);

  // ============================================
  // STEP 3 —  Assign Permissions to Roles
  // ============================================
  console.log('📌 Assigning permissions to roles...');

  // Helper function
  const getPermIds = (atoms: string[]) =>
    permissions.filter(p => atoms.includes(p.atom)).map(p => p.id);

  // ADMIN →  full access to all permissions
  const adminPermissions = permissions.map(p => p.id);

  // MANAGER →  full access to everything except delete permissions and audit log viewing
  const managerPermissions = getPermIds(
    permissionData
      .map(p => p.atom)
      .filter(
        atom => !['delete:users', 'delete:leads', 'delete:tasks', 'view:audit'].includes(atom)
      )
  );

  // AGENT → only permissions related to their daily work (viewing and creating leads, tasks, messages, customers)
  const agentPermissions = getPermIds([
    'view:dashboard',
    'view:leads',
    'create:leads',
    'view:tasks',
    'create:tasks',
    'view:assignments',
    'view:calendar',
    'view:reminders',
    'view:messages',
    'send:messages',
    'view:customers',
    'view:opportunities',
  ]);

  // CUSTOMER → only view permissions for dashboard and their own customer data
  const customerPermissions = getPermIds(['view:dashboard', 'view:customers']);

  const rolePermissionMap = [
    { roleId: adminRole.id, permIds: adminPermissions },
    { roleId: managerRole.id, permIds: managerPermissions },
    { roleId: agentRole.id, permIds: agentPermissions },
    { roleId: customerRole.id, permIds: customerPermissions },
  ];

  for (const { roleId, permIds } of rolePermissionMap) {
    await Promise.all(
      permIds.map(permissionId =>
        database.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          update: {},
          create: { roleId, permissionId },
        })
      )
    );
  }

  console.log('✅ Role permissions assigned');

  // ============================================
  // STEP 4 — default admin user
  // ============================================
  console.log('📌 Creating admin user...');

  const hashedPassword = await bcrypt.hash('Admin@1234', 12);

  await database.user.upsert({
    where: { email: 'admin@obliq.com' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'admin@obliq.com',
      password: hashedPassword,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created');
  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Credentials:');
  console.log('  Email    : admin@obliq.com');
  console.log('  Password : Admin@1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await database.$disconnect();
  });
