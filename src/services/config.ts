import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('refresh_token')
  if (token) {
    config.headers = config.headers || {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let pendingRequests: Array<(token: string | null) => void> = []

const addPendingRequest = (callback: (token: string | null) => void) => {
  pendingRequests.push(callback)
}

const resolvePendingRequests = (token: string | null) => {
  pendingRequests.forEach((cb) => cb(token))
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error.config

    // BỎ QUA 401 TỪ LOGIN & REFRESH
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    // Nếu không phải 401 -> trả lỗi bình thường
    if (status !== 401) {
      return Promise.reject(error)
    }

    // TRÁNH LẶP VÔ TẬN
    if (originalRequest._retry) {
      return Promise.reject(error)
    }
    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }

    // NHIỀU REQUEST CHỜ REFRESH
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        addPendingRequest((newToken) => {
          if (!newToken) {
            reject(error)
            return
          }
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    // BẮT ĐẦU REFRESH TOKEN
    isRefreshing = true

    try {
      const res = await axios.post(
        `${baseURL}/auth/refresh`,
        { refresh_token: refreshToken }
      )

      const newAccessToken = res.data.access_token
      const newRefreshToken = res.data.refresh_token

      // LƯU TOKEN MỚI
      localStorage.setItem('access_token', newAccessToken)
      localStorage.setItem('refresh_token', newRefreshToken)

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`

      resolvePendingRequests(newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)

    } catch (err) {
      resolvePendingRequests(null)

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')

      window.location.href = '/auth/login'
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
