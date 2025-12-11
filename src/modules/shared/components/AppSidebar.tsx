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

  const avatarUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBd7SMerdlIkXHG8hslnCQlEGKs2aF6PVHctr1GlOIYkAG9xnOV_xR_nRL1ctla-F0BoIG497-t8OCk6m11Lz8hH_oKoKGVQQ9qT0Cay93NL6c3sjdQ_YaZwsRBgU_7CbzhuXjSMkPBaFsy32Utbk8qygFNfGud-R-EbylQATUz128eQ_ReiCb8OA0wD_1OXtFIHgf4nmkLpWJoDPQveFa_Gr988WS1uMML45p5YHURPibZ1LM6TkdWp1SmhL1wzCX-JIPSIST_Ck0'

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">

      {/* USER INFO */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-2">
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("${avatarUrl}")` }}
          />
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
