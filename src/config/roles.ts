/**
 * Application Role Configuration
 * Centralized place to define and manage roles across the application
 *
 * Assign these role strings to users in Supabase (user_roles / equivalent).
 * ADMIN can access everything below.
 */

// Available roles in the system
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
  LOAN: 'LOAN',
  PAYROLL: 'PAYROLL',
  INVOICE: 'INVOICE',
  RECRUITMENT: 'RECRUITMENT',
  AOP: 'AOP',
} as const;

// Role definitions for different pages/features
export const PAGE_ROLES = {
  // Home — any authenticated user
  HOME: [],
  AUTHENTICATED_ONLY: [],
  PUBLIC_PAGES: [],

  // Loans (Overview, Client Performance, Non-Performing List)
  LOAN_DASHBOARD: [ROLES.ADMIN, ROLES.LOAN],

  // Internal / External Payroll
  PAYROLL_DASHBOARD: [ROLES.ADMIN, ROLES.PAYROLL],

  // Invoice
  INVOICE_DASHBOARD: [ROLES.ADMIN, ROLES.INVOICE],

  // Recruitment
  RECRUITMENT_DASHBOARD: [ROLES.ADMIN, ROLES.RECRUITMENT],

  // Associates On Payroll
  AOP_DASHBOARD: [ROLES.ADMIN, ROLES.AOP],

  // Legacy / unused keys kept for compatibility
  KASBON_DASHBOARD: [ROLES.ADMIN, ROLES.LOAN],
  ANALYTICS_DASHBOARD: [ROLES.ANALYST, ROLES.ADMIN],
  ADMIN_PANEL: [ROLES.ADMIN],
  USER_MANAGEMENT: [ROLES.ADMIN, ROLES.MANAGER],
} as const;

// Helper function to get roles for a specific page
export function getPageRoles(pageKey: keyof typeof PAGE_ROLES): readonly string[] {
  return PAGE_ROLES[pageKey];
}

// Helper function to check if a role is valid
export function isValidRole(role: string): boolean {
  return Object.values(ROLES).includes(role as any);
}

// Helper function to get all available roles
export function getAllRoles(): string[] {
  return Object.values(ROLES);
}
