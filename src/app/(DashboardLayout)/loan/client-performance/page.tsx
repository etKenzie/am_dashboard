'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanDashboard from '../../../components/shared/LoanDashboard';

const LoanClientPerformancePage = () => {
  return (
    <LoanDashboard
      title="Loan Client Performance"
      description="Manage loan data for employees"
      requiredRoles={getPageRoles('KASBON_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedLoanClientPerformance() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <LoanClientPerformancePage />
    </ProtectedRoute>
  );
}

