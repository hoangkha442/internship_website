export type UserProfile = {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'lecturer' | 'student'
}