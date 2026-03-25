'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import TempInternalPayrollOverview from '../../../components/temp_internal_payroll/TempInternalPayrollOverview';

export default function TempInternalPayrollClientPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <TempInternalPayrollOverview />
    </ProtectedRoute>
  );
}
