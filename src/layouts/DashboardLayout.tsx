import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppSidebar from '../modules/shared/components/AppSidebar'
import AppHeader from '../modules/shared/components/AppHeader'

const { Sider, Header, Content } = Layout

const siderWidth = 240
const headerHeight = 64

const DashboardLayout = () => {
  return (
    <Layout className="min-h-screen bg-slate-50">
      <Sider
        width={siderWidth}
        className="bg-white! border-r border-slate-200"
        style={{
          position: 'fixed',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          zIndex: 30,
        }}
      >
        <AppSidebar />
      </Sider>

      <Layout style={{ marginLeft: siderWidth }}>
        <Header
          className="bg-white! px-4 flex items-center border-b border-slate-200"
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            left: siderWidth,
            height: headerHeight,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <AppHeader />
        </Header>
        <Content
          className="bg-slate-50 p-6"
          style={{
            padding: 16,
            marginTop: headerHeight,
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
