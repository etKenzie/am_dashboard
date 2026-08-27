'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanRedesignOverview from '../../../components/loan_redesign/LoanRedesignOverview';

const LoanOverviewPage = () => {
  return (
    <LoanRedesignOverview
      title="Loan Overview"
      description="Overview of loan coverage, utilization, and repayment risk"
    />
  );
};

export default function ProtectedLoanOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanOverviewPage />
    </ProtectedRoute>
  );
}
