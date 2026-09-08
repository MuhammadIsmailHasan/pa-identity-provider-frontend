export const ROUTES = {
  // Auth
  LOGIN: '/login',
  OAUTH_AUTHORIZE: '/oauth/authorize',

  // User
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  APPS: '/apps',

  // Admin
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_EMPLOYEE_DETAIL: '/admin/employees/:id',
  ADMIN_JABATAN: '/admin/jabatan',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_CLIENT_DETAIL: '/admin/clients/:id',
  ADMIN_ROLE_MAPPINGS: '/admin/role-mappings',
  ADMIN_ROLE_OVERRIDES: '/admin/role-overrides',
} as const;
