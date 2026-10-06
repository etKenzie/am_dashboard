'use client';

import { getPageRoles } from '@/config/roles';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import RecruitmentMockupOverview from '../../components/sourcing/RecruitmentMockupOverview';

const RecruitmentMockupPage = () => {
  return <RecruitmentMockupOverview />;
};

export default function ProtectedRecruitmentMockupPage() {
  return (
    <ProtectedRoute requiredRoles={getPageRoles('RECRUITMENT_MOCKUP')}>
      <RecruitmentMockupPage />
    </ProtectedRoute>
  );
}
