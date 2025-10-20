'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const LoanOverviewPage = () => {
  return (
    <LoanOverview
      title="Loan Overview"
      description="Overview of loan data and analytics"
      requiredRoles={getPageRoles('KASBON_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedLoanOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <LoanOverviewPage />
    </ProtectedRoute>
  );
}
