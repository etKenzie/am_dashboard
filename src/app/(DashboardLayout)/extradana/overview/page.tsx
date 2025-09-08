'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import LoanOverview from '../../../components/shared/LoanOverview';

const ExtradanaOverview = () => {
  return (
    <LoanOverview
      loanType="extradana"
      title="Extradana Overview"
      description="Overview of extradana data and analytics"
      requiredRoles={getPageRoles('KASBON_DASHBOARD')} // Using same roles for now
    />
  );
};

export default function ProtectedExtradanaOverview() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <ExtradanaOverview />
    </ProtectedRoute>
  );
}
