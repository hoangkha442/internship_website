import { Typography } from 'antd'

const { Title, Paragraph } = Typography

type Props = {
  title: string
  subtitle?: string
}

const PageHeader = ({ title, subtitle }: Props) => {
  return (
    <div className="mb-2">
      <Title level={3} className="mb-1">
        {title}
      </Title>
      {subtitle && (
        <Paragraph className="text-slate-500 mb-0">
          {subtitle}
        </Paragraph>
      )}
    </div>
  )
}

export default PageHeader
