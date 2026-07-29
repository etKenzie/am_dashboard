'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanRedesignOverview from '../../../components/loan_redesign/LoanRedesignOverview';

const LoanClientPerformancePage = () => {
  return <LoanRedesignOverview />;
};

export default function ProtectedLoanClientPerformance() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanClientPerformancePage />
    </ProtectedRoute>
  );
}
