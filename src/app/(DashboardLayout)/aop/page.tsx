'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import AopOverview from '../../components/aop/AopOverview';

const AopPage = () => {
  return <AopOverview />;
};

export default function ProtectedAopPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('PAYROLL_DASHBOARD')}>
      <AopPage />
    </ProtectedRoute>
  );
}
