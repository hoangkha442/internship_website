import { useRoutes, Navigate } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../modules/auth/pages/LoginPage'
import StudentDashboard from '../modules/student/pages/StudentDashboard'
import LecturerDashboard from '../modules/lecturer/pages/LecturerDashboard'
import AdminDashboard from '../modules/admin/pages/AdminDashboard'
import ProtectedRoute from './ProtectedRoute'
import AdminStudentsPage from '../modules/admin/pages/AdminStudentsPage'
import AdminLecturerPage from '../modules/admin/pages/AdminLecturerPage'
import AdminTermsPage from '../modules/admin/pages/AdminTermsPage/AdminTermsPage'

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
        // Student
        {
          path: 'student',
          children: [
            { index: true, element: <StudentDashboard /> },
          ],
        },
        {
          path: 'lecturer',
          children: [
            { index: true, element: <LecturerDashboard /> },
          ],
        },
        {
          path: 'admin',
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: 'students', element: <AdminStudentsPage /> },
            { path: 'lecturers', element: <AdminLecturerPage /> },
            { path: 'terms', element: <AdminTermsPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/auth/login" /> },
  ])

  return element
}

export default AppRouter
