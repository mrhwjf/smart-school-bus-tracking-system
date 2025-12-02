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
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'

const { Title, Text } = Typography

function RoleForm({ role, onSubmit }) {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const handleFinish = (vals) => onSubmit(role, vals)

  const placeholder = role === 'driver' ? t('login.identifier_driver_placeholder') : t('login.identifier_placeholder')
  const Icon = role === 'driver' ? CarOutlined : role === 'parent' ? HomeOutlined : UserOutlined
  const submitLabel = role === 'admin' ? t('login.login_admin') : role === 'driver' ? t('login.login_driver') : t('login.login_parent')

  return (
    <Form form={form} name={role} layout="vertical" onFinish={handleFinish}>
      <Form.Item name="identifier" label={placeholder} rules={[{ required: true, message: t('login.required_identifier') }] }>
        {/* [FIX] Thêm autoFocus để tự động focus khi chuyển tab */}
        <Input prefix={<Icon />} autoFocus />
      </Form.Item>
      <Form.Item name="password" label={t('login.password')} rules={[{ required: true, message: t('login.required_password') }] }>
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
  const { t } = useTranslation()

  const onSubmit = (r, values) => {
    ;(async () => {
      try {
        const res = await AdminService.login(r, values)
        if (!res || !res.success) {
          message.error(res?.message || t('login.failed'))
          return
        }
        localStorage.setItem('authToken', res.token)
        localStorage.setItem('authUser', JSON.stringify({ role: r, user: res.user }))
        // Notify layout to re-check auth state when already at '/'
        window.dispatchEvent(new Event('auth:changed'))
        message.success(t('login.success'))
        
        if (r === 'admin') {
          navigate('/')
        } else if(r === 'parent'){
          navigate('/HoSoCuaToi')
        } else if (r === 'driver'){
          navigate('/driver')
        }
         else {
          // Chưa có layout/route cho driver/parent → chuyển sang trang lỗi tạm thời
          navigate('/error')
        } 
        
      } catch (err) {
        console.error('login error', err)
          message.error(t('login.error'))
      }
    })()
  }

  return (
    <Row justify="center" align="middle" className="login-root">
      <div className="global-lang-switcher">
        <LanguageSwitcher />
      </div>
      <Col className="login-col">
        <Card bordered={false} className="login-card">
          <div className="login-header">
            <img src={logo} alt="SSB Logo" className="login-logo" />
            <Title level={4} style={{ margin: '8px 0 0' }}>{t('welcomeTitle')}</Title>
            <Text type="secondary">{t('welcomeSubtitle')}</Text>
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
              <Tabs.TabPane tab={<span><img src={adminPng} alt="admin" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> {t('loginTabs.admin')}</span>} key="admin" />
              <Tabs.TabPane tab={<span><img src={driverPng} alt="driver" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> {t('loginTabs.driver')}</span>} key="driver" />
              <Tabs.TabPane tab={<span><img src={familyPng} alt="family" style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }} /> {t('loginTabs.parent')}</span>} key="parent" />
            </Tabs>

            <div className={`login-form-wrap fade-content ${hidden ? 'hidden' : ''}`}>
              {/* [FIX] Thêm key={displayedRole} để ép render lại form mới hoàn toàn (reset dữ liệu) khi đổi tab */}
              <RoleForm role={displayedRole} onSubmit={onSubmit} key={displayedRole} />
            </div>
          </div>

          <Space direction="vertical" className="login-footer">
            <Text type="secondary" style={{ fontSize: 12 }}>{t('login.version')}</Text>
          </Space>
        </Card>
      </Col>
    </Row>
  )
}