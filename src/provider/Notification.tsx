import { createContext, useContext, useState, type ReactNode } from 'react'

type NoticeType = 'success' | 'error' | 'info' | 'warning'

type Notice = {
  id: number
  type: NoticeType
  message: string
}

type NotificationContextType = {
  notify: (type: NoticeType, message: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

const baseNoticeClass =
  'relative px-4 py-3 rounded-xl shadow-lg text-sm text-slate-50 ' +
  'backdrop-blur-md border flex items-start gap-2 animate-slide-in'

const getTypeClass = (type: NoticeType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-600/90 border-emerald-300/60'
    case 'error':
      return 'bg-rose-600/90 border-rose-300/60'
    case 'info':
      return 'bg-sky-600/90 border-sky-300/60'
    case 'warning':
      return 'bg-amber-600/90 border-amber-300/60'
    default:
      return 'bg-slate-700/90 border-slate-400/60'
  }
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [list, setList] = useState<Notice[]>([])

  const notify = (type: NoticeType, message: string) => {
    const id = Date.now()

    setList((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setList((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed top-4 right-4 space-y-3 z-50">
        {list.map((n) => (
          <div
            key={n.id}
            className={`${baseNoticeClass} ${getTypeClass(n.type)}`}
          >
            <div className="mt-1.5 h-2 w-2 rounded-full bg-slate-100/80" />
            <div className="leading-snug">{n.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider')
  return ctx
}
