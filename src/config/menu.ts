export interface MenuItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    iconName: 'SquaresFour',
  },
  {
    title: 'Khóa học',
    href: '/courses',
    iconName: 'BookOpen',
    badge: '24',
  },
  {
    title: 'Video & Xử lý AI',
    href: '/videos',
    iconName: 'FilmStrip',
    badge: '3',
  },
  {
    title: 'Ngân hàng câu hỏi',
    href: '/questions',
    iconName: 'Database',
  },
  {
    title: 'Bài tập & Kiểm tra',
    href: '/exercises',
    iconName: 'ListChecks',
  },
  {
    title: 'Giảng viên',
    href: '/instructors',
    iconName: 'ChalkboardTeacher',
  },
  {
    title: 'Học viên',
    href: '/students',
    iconName: 'Users',
  },
  {
    title: 'Doanh thu',
    href: '/revenue',
    iconName: 'CurrencyCircleDollar',
  },
  {
    title: 'Báo cáo & Phân tích',
    href: '/reports',
    iconName: 'ChartBar',
  },
  {
    title: 'Cài đặt hệ thống',
    href: '/settings',
    iconName: 'Gear',
  },
];
