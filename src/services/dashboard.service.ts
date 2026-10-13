import { apiClient } from './api-client';
import { mockDashboardData } from './mock/dashboard.mock';
import { DashboardOverviewData } from '@/types/dashboard.types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export const dashboardService = {
  /**
   * Lấy dữ liệu tổng quan Dashboard (Có độ trễ 800ms để kiểm tra Skeleton)
   */
  async getOverview(): Promise<DashboardOverviewData> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return mockDashboardData;
    }

    const response = await apiClient.get<DashboardOverviewData>('/api/admin/dashboard/overview');
    return response.data;
  },
};
