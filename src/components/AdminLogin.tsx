import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

// 管理员账号（正式使用时改为环境变量或后端验证）
const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'ssol2024',
};

export default function AdminLogin({ onBack, onLogin }: AdminLoginProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟验证（正式使用时连接后端）
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      if (values.username === ADMIN_ACCOUNT.username && 
          values.password === ADMIN_ACCOUNT.password) {
        message.success('登录成功');
        onLogin();
      } else {
        message.error('账号或密码错误');
      }
    } catch (error) {
      // 验证失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page" style={{ paddingTop: 80 }}>
      <div className="register-container" style={{ maxWidth: 400 }}>
        <Card className="register-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <LockOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            <h2 style={{ marginTop: 16, marginBottom: 8 }}>管理员登录</h2>
            <p style={{ color: '#999', fontSize: 13 }}>请输入管理员账号和密码</p>
          </div>

          <Form form={form} layout="vertical" size="large">
            <Form.Item 
              name="username" 
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="管理员账号" 
              />
            </Form.Item>

            <Form.Item 
              name="password" 
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密码" 
              />
            </Form.Item>

            <Button 
              type="primary" 
              block 
              onClick={handleLogin} 
              loading={loading}
              style={{ marginTop: 8 }}
            >
              登录
            </Button>
          </Form>

          <div style={{ marginTop: 24, padding: '12px', background: '#f5f5f5', borderRadius: 6, fontSize: 12, color: '#666' }}>
            <strong>测试账号：</strong><br/>
            账号：admin<br/>
            密码：ssol2024
          </div>
        </Card>
      </div>
    </div>
  );
}
