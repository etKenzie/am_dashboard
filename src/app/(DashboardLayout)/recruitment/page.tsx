'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RecruitmentOverview from '../../components/recruitment/RecruitmentOverview';

const RecruitmentPage = () => {
  return <RecruitmentOverview />;
};

export default function ProtectedRecruitmentPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('KASBON_DASHBOARD')}>
      <RecruitmentPage />
    </ProtectedRoute>
  );
}
