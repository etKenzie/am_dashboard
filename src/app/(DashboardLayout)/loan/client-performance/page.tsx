'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const LoanClientPerformancePage = () => {
  return (
    <LoanOverview
      title="Client Performance"
      description="Analyze client performance metrics and trends"
      requiredRoles={getPageRoles('LOAN_DASHBOARD')}
    />
  );
};

export default function ProtectedLoanClientPerformance() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanClientPerformancePage />
    </ProtectedRoute>
  );
}
