'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import ExternalPayrollDashboard from '../../components/external_payroll/ExternalPayrollDashboard';

const ExternalPayrollPage = () => {
  return (
    <ExternalPayrollDashboard
      title="External Payroll"
      description="View external payroll metrics and analytics"
      requiredRoles={getPageRoles('KASBON_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedExternalPayroll() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <ExternalPayrollPage />
    </ProtectedRoute>
  );
}
