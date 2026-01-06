import { useLocation, useNavigate } from 'react-router-dom'
import RoleBadge from './RoleBadge'
import { sidebarConfig, type SidebarRole, type SidebarLink } from './sidebarConfig'
import { useAuth } from '../hooks/useAuth'

const AppSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <aside className="w-64 border-r border-slate-200 bg-white p-4">
        <p className="text-center text-slate-500 text-sm">Loading...</p>
      </aside>
    )
  }

  const role = user.role as SidebarRole
  const config = sidebarConfig[role] || sidebarConfig.student

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const handleNavClick = (item: SidebarLink) => {
    if (item.action === 'logout') {
      handleLogout()
      return
    }
    if (item.path) navigate(item.path)
  }

  const isActive = (item: SidebarLink) => {
    if (!item.path) return false
    return location.pathname === item.path
  }

  const renderNavItem = (item: SidebarLink) => {
    const active = isActive(item)

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => handleNavClick(item)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
          ${active ? 'bg-primary/20 text-primary font-medium' : 'text-slate-700 hover:bg-slate-100'}
        `}
      >
        <span className="material-symbols-outlined text-xl">{item.icon}</span>
        <p>{item.label}</p>
      </button>
    )
  }

  // ✅ resolve avatar url from backend
  const apiBase = import.meta.env.VITE_API_BASE_URL as string
  const avatarUrl = (() => {
    const u = (user as any)?.avatar_url as string | null | undefined
    if (!u) return null
    try {
      // u: "/uploads/avatars/xxx.png" -> full url
      return new URL(u, apiBase).toString()
    } catch {
      return u
    }
  })()

  const fallbackLetter = (user.full_name?.trim()?.[0] || 'U').toUpperCase()

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">

      {/* USER INFO */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-2">
          {avatarUrl ? (
            <div
              className="size-10 rounded-full bg-cover bg-center bg-slate-200"
              style={{ backgroundImage: `url("${avatarUrl}")` }}
            />
          ) : (
            <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold">
              {fallbackLetter}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <h1 className="text-slate-900 text-sm font-medium">{user.full_name}</h1>
            <div className="text-xs text-slate-500">
              <RoleBadge role={role} />
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-4">
          {config.main.map(renderNavItem)}
        </nav>
      </div>

      <div className="flex flex-col gap-1">
        {config.bottom.map((item) => {
          const isLogout = item.action === 'logout'
          const active = isActive(item)

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer
                ${
                  isLogout
                    ? 'text-red-700 hover:bg-red-100'
                    : active
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-slate-700 hover:bg-slate-100'
                }
              `}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <p>{item.label}</p>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default AppSidebar
