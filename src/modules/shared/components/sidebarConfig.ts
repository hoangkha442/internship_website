export type SidebarRole = 'admin' | 'lecturer' | 'student'

export type SidebarLink = {
  key: string
  label: string
  icon: string          
  path?: string         
  action?: 'logout'   
}

export type SidebarConfig = {
  main: SidebarLink[]
  bottom: SidebarLink[]
}

export const sidebarConfig: Record<SidebarRole, SidebarConfig> = {
  admin: {
    main: [
      { key: 'admin-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/admin' },
      { key: 'admin-students', label: 'Quản lý sinh viên', icon: 'group', path: '/admin/students' },
      { key: 'admin-lecturers', label: 'Quản lý giảng viên', icon: 'school', path: '/admin/lecturers' },
      { key: 'admin-classes', label: 'Lớp thực tập', icon: 'corporate_fare', path: '/admin/classes' },
      { key: 'admin-terms', label: 'Kỳ thực tập', icon: 'event', path: '/admin/terms' },
      { key: 'admin-topics', label: 'Đề tài thực tập', icon: 'menu_book', path: '/admin/topics' },
      { key: 'admin-attendance', label: 'Điểm danh', icon: 'calendar_month', path: '/admin/attendance' },
      { key: 'admin-reports', label: 'Báo cáo tiến độ', icon: 'assessment', path: '/admin/reports' },
      { key: 'admin-logbook', label: 'Nhật ký công việc', icon: 'article', path: '/admin/logbook' },
      { key: 'admin-statistics', label: 'Thống kê - Báo cáo', icon: 'query_stats', path: '/admin/statistics' },
    ],
    bottom: [
      { key: 'admin-settings', label: 'Cài đặt hệ thống', icon: 'settings', path: '/admin/settings' },
      { key: 'admin-logout', label: 'Đăng xuất', icon: 'logout', action: 'logout' },
    ],
  },

  lecturer: {
    main: [
      { key: 'lec-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/lecturer' },
      { key: 'lec-students', label: 'Sinh viên phụ trách', icon: 'group', path: '/lecturer/students' },
      { key: 'lec-attendance', label: 'Duyệt điểm danh', icon: 'calendar_month', path: '/lecturer/attendance' },
      { key: 'lec-reports', label: 'Đánh giá báo cáo', icon: 'assignment_turned_in', path: '/lecturer/reports' },
      { key: 'lec-notes', label: 'Ghi chú & phản hồi', icon: 'chat', path: '/lecturer/notes' },
    ],
    bottom: [
      { key: 'lec-settings', label: 'Cài đặt', icon: 'settings', path: '/lecturer/settings' },
      { key: 'lec-logout', label: 'Đăng xuất', icon: 'logout', action: 'logout' },
    ],
  },
  student: {
    main: [
      { key: 'stu-dashboard', label: 'Dashboard', icon: 'dashboard', path: '/student' },
      { key: 'stu-profile', label: 'Hồ sơ thực tập', icon: 'badge', path: '/student/profile' },
      { key: 'stu-topic', label: 'Đề tài thực tập', icon: 'menu_book', path: '/student/topic' },
      { key: 'stu-attendance', label: 'Điểm danh', icon: 'calendar_month', path: '/student/attendance' },
      { key: 'stu-reports', label: 'Báo cáo tiến độ', icon: 'assignment', path: '/student/reports' },
      { key: 'stu-logbook', label: 'Nhật ký', icon: 'article', path: '/student/logbook' },
    ],
    bottom: [
      { key: 'stu-settings', label: 'Cài đặt', icon: 'settings', path: '/student/settings' },
      { key: 'stu-logout', label: 'Đăng xuất', icon: 'logout', action: 'logout' },
    ],
  },
}
