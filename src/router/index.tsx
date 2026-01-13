import { useRoutes, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../modules/auth/pages/LoginPage'
import LecturerDashboard from '../modules/lecturer/pages/LecturerDashboard/LecturerDashboard'
import AdminDashboard from '../modules/admin/pages/AdminDashboard'
import ProtectedRoute from './ProtectedRoute'
import AdminStudentsPage from '../modules/admin/pages/AdminStudentsPage'
import AdminLecturerPage from '../modules/admin/pages/AdminLecturerPage'
import AdminTermsPage from '../modules/admin/pages/AdminTermsPage/AdminTermsPage'
import NotFoundPage from '../modules/shared/components/NotFoundPage'
import StudentInternshipTopics from '../modules/student/pages/StudentInternshipTopics'
import StudentInternshipProfilePage from '../modules/student/pages/StudentInternshipProfilePage'
import LecturerTopicsPage from '../modules/lecturer/pages/LecturerTopicsPage'
import { LecturerSupervisedStudentsPage } from '../modules/lecturer/pages/LecturerSupervisedStudentsPage'
import StudentWorklogsPage from '../modules/student/pages/StudentWorklogsPage'
import LecturerWorklogReviewPage from '../modules/lecturer/pages/LecturerWorklogReviewPage'
import AdminTermTopicsPage from '../modules/admin/pages/AdminTopicsPage'
import AccountPage from '../modules/shared/components/AccountPage'
import AttendancePage from '../modules/student/pages/AttendancePage'
import AttendanceLecturerPage from '../modules/lecturer/pages/AttendanceLecturerPage'
import StudentProgressReportsPage from '../modules/student/pages/ProgressReports'
import LecturerReportsReviewPage from '../modules/lecturer/pages/LecturerReport'
import StudentDashboardPage from '../modules/student/pages/StudentDashboard'
// import LecturerApprovalsPage from '../modules/lecturer/pages/approvals'

const AppRouter = () => {
  const element = useRoutes([
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { path: 'login', element: <LoginPage /> },
        { index: true, element: <Navigate to="login" /> },
      ],
    },
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: 'student',
          children: [
            { index: true, element: <StudentDashboardPage /> },
            { path: '/student/profile', element: <StudentInternshipProfilePage />},
            { path: '/student/topic', element: <StudentInternshipTopics />},
            { path: '/student/worklogs', element: <StudentWorklogsPage /> },
            { path: 'reports', element: <StudentProgressReportsPage /> },
            { path: '/student/account', element: <AccountPage /> },
            { path: '/student/attendance', element: <AttendancePage /> },
          ],
        },
        {
          path: 'lecturer',
          children: [
            { index: true, element: <LecturerDashboard /> },
            { path: '/lecturer/topics', element: <LecturerTopicsPage />},
            { path: '/lecturer/approvals', element: <LecturerSupervisedStudentsPage />},
            { path: "/lecturer/reports", element: <LecturerReportsReviewPage /> },
            { path: '/lecturer/worklogs', element: <LecturerWorklogReviewPage /> },
            { path: '/lecturer/account', element: <AccountPage /> },
            { path: '/lecturer/attendance', element: <AttendanceLecturerPage /> },
          ],
        },
        {
          path: 'admin',
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'students', element: <AdminStudentsPage /> },
            { path: 'lecturers', element: <AdminLecturerPage /> },
            { path: 'terms', element: <AdminTermsPage /> },
            { path: 'topics', element: <AdminTermTopicsPage /> },
            { path: 'account', element: <AccountPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <NotFoundPage /> },
  ])

  return element
}

export default AppRouter
