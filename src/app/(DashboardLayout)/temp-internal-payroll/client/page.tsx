'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import TempInternalPayrollClientOverview from '../../../components/temp_internal_payroll/TempInternalPayrollClientOverview';

export default function TempInternalPayrollClientPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <TempInternalPayrollClientOverview />
    </ProtectedRoute>
  );
}
