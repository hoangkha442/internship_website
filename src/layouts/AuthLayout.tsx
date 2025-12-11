import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <main className="h-screen bg-slate-100">
        <div className="w-full bg-white rounded-lg shadow">
          <Outlet />
        </div>
    </main>
  )
}

export default AuthLayout
