'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import InternalPayrollDashboard from '../../components/internal_payroll/InternalPayrollDashboard';

const InternalPayrollPage = () => {
  return (
    <InternalPayrollDashboard
      title="Internal Payroll"
      description="View internal payroll metrics and analytics"
      requiredRoles={getPageRoles('KASBON_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedInternalPayroll() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <InternalPayrollPage />
    </ProtectedRoute>
  );
}

