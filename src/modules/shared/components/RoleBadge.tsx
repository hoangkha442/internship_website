
import { Tag } from 'antd'
import type { UserRole } from '../../../services/authApi'

type Props = {
  role: UserRole
}

const RoleBadge = ({ role }: Props) => {
  if (role === 'student') {
    return <Tag color="blue">Sinh viên</Tag>
  }

  if (role === 'lecturer') {
    return <Tag color="green">Giảng viên</Tag>
  }

  return <Tag color="red">Admin</Tag>
}

export default RoleBadge
