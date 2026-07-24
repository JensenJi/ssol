import { useState } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import { LockOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

// 管理员凭证存储 key
const ADMIN_CREDENTIALS_KEY = 'ssol_admin_credentials';

// 获取管理员凭证（优先从 localStorage 读取正式设置的，否则使用默认）
function getAdminCredentials() {
  try {
    const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { username: 'admin', password: 'ssol2024' };
}

// 保存正式管理员凭证
function saveAdminCredentials(username: string, password: string) {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({ username, password }));
}

export default function AdminLogin({ onBack, onLogin }: AdminLoginProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupForm] = Form.useForm();

  const credentials = getAdminCredentials();
  const isDefault = !localStorage.getItem(ADMIN_CREDENTIALS_KEY);

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (values.username === credentials.username && values.password === credentials.password) {
        message.success('登录成功');
        onLogin();
      } else {
        message.error('账号或密码错误');
      }
    } catch {
      // 验证失败
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      const values = await setupForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次密码不一致');
        return;
      }
      if (values.newPassword.length < 6) {
        message.error('密码至少6位');
        return;
      }
      saveAdminCredentials(values.newUsername || 'admin', values.newPassword);
      message.success('管理员账号已更新，请用新账号登录');
      setSetupOpen(false);
      setupForm.resetFields();
      form.resetFields();
    } catch {
      // 验证失败
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
            <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
              <Input prefix={<UserOutlined />} placeholder="管理员账号" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Button type="primary" block onClick={handleLogin} loading={loading} style={{ marginTop: 8 }}>
              登录
            </Button>
          </Form>

          {/* 重置密码入口（始终可见） */}
          <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isDefault ? (
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => setSetupOpen(true)}
                style={{ fontSize: 13 }}
              >
                首次使用？点击设置正式管理员账号
              </Button>
            ) : (
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: '重置管理员密码',
                    content: '确定要重置管理员密码为默认值吗？',
                    okText: '确认重置',
                    cancelText: '取消',
                    onOk: () => {
                      localStorage.removeItem(ADMIN_CREDENTIALS_KEY);
                      message.success('密码已重置为默认（admin / ssol2024）');
                      form.resetFields();
                    },
                  });
                }}
                style={{ fontSize: 13 }}
              >
                忘记密码？重置为默认密码
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 设置正式管理员账号弹窗 */}
      <Modal
        title={<span><SettingOutlined style={{ color: '#1677ff', marginRight: 8 }} />设置正式管理员账号</span>}
        open={setupOpen}
        onCancel={() => { setSetupOpen(false); setupForm.resetFields(); }}
        onOk={handleSetup}
        okText="确认设置"
        cancelText="取消"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
            设置后，测试账号将失效。请牢记新账号和密码。
          </p>
          <Form form={setupForm} layout="vertical" size="large">
            <Form.Item name="newUsername" label="新账号" initialValue="admin">
              <Input prefix={<UserOutlined />} placeholder="管理员账号" />
            </Form.Item>
            <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="至少6位" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请再次输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="再次输入密码" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

