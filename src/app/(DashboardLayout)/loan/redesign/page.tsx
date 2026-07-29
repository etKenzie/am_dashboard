'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

const LoanRedesignRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/loan/client-performance');
  }, [router]);

  return null;
};

export default function ProtectedLoanRedesignPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('LOAN_DASHBOARD')}>
      <LoanRedesignRedirectPage />
    </ProtectedRoute>
  );
}
