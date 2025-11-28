import React, { useState } from 'react'
import { Card, Row, Col } from 'antd'
import { Form, Input, Button, Tabs, Typography, Space, message } from 'antd'
import { UserOutlined, LockOutlined, CarOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/logo-schoolbus.svg'
import adminPng from '../../assets/administrator.png'
import driverPng from '../../assets/driver.png'
import familyPng from '../../assets/family.png'
import './Login.css'
import { AdminService } from '../../api/services'

const { Title, Text } = Typography

function RoleForm({ role, onSubmit }) {
  const [form] = Form.useForm()
  const handleFinish = (vals) => onSubmit(role, vals)

  const placeholder = role === 'driver' ? 'Số điện thoại hoặc ID tài xế' : 'Số điện thoại hoặc email'
  const Icon = role === 'driver' ? CarOutlined : role === 'parent' ? HomeOutlined : UserOutlined
  const submitLabel = role === 'admin' ? 'Đăng nhập với tư cách Admin' : role === 'driver' ? 'Đăng nhập cho Tài xế' : 'Đăng nhập cho Phụ huynh'

  return (
    <Form form={form} name={role} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="identifier" label={placeholder} rules={[{ required: true, message: 'Vui lòng nhập thông tin!' }] }>
        {/* [FIX] Thêm autoFocus để tự động focus khi chuyển tab */}
        <Input prefix={<Icon />} autoFocus />
      </Form.Item>
      <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }] }>
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>{submitLabel}</Button>
      </Form.Item>
    </Form>
  )
}

export default function Login() {
  const [role, setRole] = useState('admin')
  const [displayedRole, setDisplayedRole] = useState('admin')
  const [hidden, setHidden] = useState(false)
  const navigate = useNavigate()

  const onSubmit = (r, values) => {
    ;(async () => {
      try {
        const res = await AdminService.login(r, values)
        if (!res || !res.success) {
          message.error(res?.message || 'Đăng nhập thất bại')
          return
        }
        localStorage.setItem('authToken', res.token)
        localStorage.setItem('authUser', JSON.stringify({ role: r, user: res.user }))
        // Notify layout to re-check auth state when already at '/'
        window.dispatchEvent(new Event('auth:changed'))
        message.success('Đăng nhập thành công')
        
        if (r === 'admin') {
          navigate('/')
        } else {
          // Chưa có layout/route cho driver/parent → chuyển sang trang lỗi tạm thời
          navigate('/error')
        }
      } catch (err) {
        console.error('login error', err)
        message.error('Lỗi đăng nhập')
      }
    })()
  }

  return (
    <Row justify="center" align="middle" className="login-root">
      <Col className="login-col">
        <Card bordered={false} className="login-card">
          <div className="login-header">
            <img src={logo} alt="SSB Logo" className="login-logo" />
            <Title level={4} style={{ margin: '8px 0 0' }}>Chào mừng đến SSB</Title>
            <Text type="secondary">Hệ thống quản lý và giám sát xe đưa đón học sinh</Text>
          </div>

          <div style={{ marginTop: 18 }}>
            <Tabs
              activeKey={role}
              onChange={(k) => {
                if (k === role) return
                setRole(k)
                setHidden(true)
                window.setTimeout(() => {
                  setDisplayedRole(k)
                  setHidden(false)
                }, 220)
              }}
              centered
              className="login-tabs"
            >
              <Tabs.TabPane tab={<span><img src={adminPng} alt="admin" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> Admin</span>} key="admin" />
              <Tabs.TabPane tab={<span><img src={driverPng} alt="driver" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> Tài xế</span>} key="driver" />
              <Tabs.TabPane tab={<span><img src={familyPng} alt="family" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> Phụ huynh</span>} key="parent" />
            </Tabs>

            <div className={`login-form-wrap fade-content ${hidden ? 'hidden' : ''}`}>
              {/* [FIX] Thêm key={displayedRole} để ép render lại form mới hoàn toàn (reset dữ liệu) khi đổi tab */}
              <RoleForm role={displayedRole} onSubmit={onSubmit} key={displayedRole} />
            </div>
          </div>

          <Space direction="vertical" className="login-footer">
            <Text type="secondary" style={{ fontSize: 12 }}>Phiên bản SSB 1.0</Text>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}