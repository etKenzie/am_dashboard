'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import SourcingOverview from '../../components/sourcing/SourcingOverview';

const SourcingPage = () => {
  return <SourcingOverview />;
};

export default function ProtectedSourcingPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('SOURCING_DASHBOARD')}>
      <SourcingPage />
    </ProtectedRoute>
  );
}
