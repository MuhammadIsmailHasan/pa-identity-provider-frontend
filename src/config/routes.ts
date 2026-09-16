export const ROUTES = {
  // Auth
  LOGIN: '/login',
  LOGOUT: '/logout',
  OAUTH_AUTHORIZE: '/oauth/authorize',

  // User
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/profile/password',
  APPS: '/apps',

  // Admin
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_EMPLOYEE_DETAIL: '/admin/employees/:id',
  ADMIN_JABATAN: '/admin/jabatan',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_CLIENT_DETAIL: '/admin/clients/:id',
  ADMIN_ROLE_MAPPINGS: '/admin/role-mappings',
} as const;
