'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RecruitmentMockupOverview from '../../components/sourcing/RecruitmentMockupOverview';

const RecruitmentPage = () => {
  return <RecruitmentMockupOverview />;
};

export default function ProtectedRecruitmentPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('RECRUITMENT_DASHBOARD')}>
      <RecruitmentPage />
    </ProtectedRoute>
  );
}
