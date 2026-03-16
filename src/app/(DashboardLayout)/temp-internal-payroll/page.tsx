'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import TempInternalPayrollOverview from '../../components/temp_internal_payroll/TempInternalPayrollOverview';

const TempInternalPayrollPage = () => {
  return <TempInternalPayrollOverview />;
};

//TESTING
export default function ProtectedTempInternalPayroll() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <TempInternalPayrollPage />
    </ProtectedRoute>
  );
}
