


import { Tabs, Card } from 'antd';
import PageHeader from '../../../shared/components/PageHeader';
import AdminInternshipTermsTab from '../../_components/AdminInternshipTermsTab';
import AdminInternshipsTab from '../../_components/AdminInternshipTabs';


const AdminInternshipsPage = () => {
  return (
    <div className="p-6 flex flex-col gap-4">
      <PageHeader
        title="Quản lý thực tập"
        subtitle="Quản lý kỳ thực tập và danh sách sinh viên thực tập."
      />

      <Card className="shadow-sm border border-slate-100">
        <Tabs
          defaultActiveKey="internships"
          items={[
            {
              key: 'internships',
              label: 'Danh sách thực tập',
              children: <AdminInternshipsTab />,
            },
            {
              key: 'terms',
              label: 'Kỳ thực tập',
              children: <AdminInternshipTermsTab />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AdminInternshipsPage;
