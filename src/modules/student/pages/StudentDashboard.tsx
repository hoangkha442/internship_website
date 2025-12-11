// src/modules/student/pages/StudentDashboard.tsx
import { Card, Col, Row, Statistic, Typography } from 'antd'
import PageHeader from '../../shared/components/PageHeader'

const { Title, Paragraph } = Typography

const StudentDashboard = () => {
  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Bảng điều khiển sinh viên"
        subtitle="Theo dõi nhanh trạng thái điểm danh, báo cáo và tiến độ thực tập"
      />

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Số ngày đã điểm danh" value={9} suffix="/ 12 tuần" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Báo cáo đã nộp" value={2} suffix="/ 3" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Tiến độ đề tài" value={60} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={4}>Cảnh báo gần đây</Title>
        <Paragraph className="text-slate-600">
          Tuần này bạn còn 1 lần báo cáo tiến độ chưa nộp và 1 ngày chưa điểm danh
        </Paragraph>
      </Card>
    </div>
  )
}

export default StudentDashboard
