export interface KpiStat {
  key: string;
  label: string;
  value: string;
  deltaPercent: number;
  deltaLabel: string;
  isPositive: boolean;
  type: 'revenue' | 'students' | 'ai_questions' | 'videos';
  errorCount?: number;
  statusText?: string;
  linkHref?: string;
}

export interface RevenuePoint {
  date: string;       // "01/09", "05/09", ...
  revenue: number;    // VND
}

export interface StudentGrowthPoint {
  week: string;       // "Tuần 1", "Tuần 2", ...
  count: number;
}

export interface PipelineItem {
  id: string;
  lessonName: string;
  fileName: string;
  progressPercent: number;
  stageName: string;
  status: 'processing' | 'completed' | 'error';
  stages: {
    upload: boolean;
    stt: 'done' | 'running' | 'error' | 'pending';
    vector: 'done' | 'running' | 'pending';
  };
}

export interface RecentActivityItem {
  id: string;
  timeAgo: string;
  actionTitle: string;
  actionIcon: 'cart' | 'quiz' | 'pipeline' | 'user' | 'ai';
  targetTitle: string;
  targetSub: string;
  statusText: string;
  statusColor: 'emerald' | 'purple' | 'amber' | 'rose' | 'neutral';
  detailLink?: string;
  detailLabel: string;
}

export interface DashboardOverviewData {
  kpis: KpiStat[];
  revenueTrend: {
    data: RevenuePoint[];
    averagePerDay: number;
    completionRate: string;
  };
  studentGrowth: {
    data: StudentGrowthPoint[];
    totalThisMonth: number;
    growthPercent: number;
  };
  recentActivities: RecentActivityItem[];
  pipelineVideos: PipelineItem[];
}
