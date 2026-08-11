import { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Tabs, Form } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onRegister: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  onResetPassword: (email: string) => Promise<{ error: any }>;
  onSuccess: (email?: string) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, onLogin, onRegister, onResetPassword, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [form] = Form.useForm();

  // 弹窗打开时同步到指定模式
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      form.resetFields();
    }
  }, [open, initialMode]);

  const handleResetPassword = async () => {
    if (!resetEmail) { message.warning('请输入注册邮箱'); return; }
    setLoading(true);
    const { error } = await onResetPassword(resetEmail);
    setLoading(false);
    if (error) { message.error(error.message); return; }
    message.success('重置链接已发送到邮箱，请查收');
    setMode('login');
    setResetEmail('');
  };

  const handleLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const { error } = await onLogin(values.email, values.password);
      setLoading(false);
      if (error) {
        message.error(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message);
        return;
      }
      message.success('登录成功！');
      form.resetFields();
      onSuccess(values.email);
    } catch {
      // validation failed
    }
  };

  const handleRegister = async () => {
    try {
      const values = await form.validateFields();
      if (values.password !== values.confirmPassword) {
        message.error('两次密码不一致');
        return;
      }
      setLoading(true);
      const { error } = await onRegister(values.email, values.password, values.displayName || '');
      setLoading(false);
      if (error) {
        if (error.message.includes('验证')) {
          message.info(error.message);
          setMode('login');
          form.resetFields();
        } else {
          message.error(error.message);
        }
        return;
      }
      message.success('注册成功！请登录');
      setMode('login');
      form.setFieldsValue({ email: values.email });
      form.resetFields(['password', 'confirmPassword']);
    } catch {
      // validation failed
    }
  };

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="your@email.com" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="输入密码" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginBottom: 8 }}>
            <a onClick={() => setMode('reset')} style={{ color: '#1677ff', fontSize: 13, cursor: 'pointer' }}>忘记密码？</a>
          </div>
          <Button type="primary" onClick={handleLogin} loading={loading} block size="large" style={{ marginTop: 8 }}>
            登录
          </Button>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="displayName" label="昵称">
            <Input prefix={<UserOutlined />} placeholder="选填，展示用名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="your@email.com" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="设置密码（至少6位）" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="再输入一次密码" />
          </Form.Item>
          <Button type="primary" onClick={handleRegister} loading={loading} block size="large" style={{ marginTop: 8 }}>
            注册
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => { onClose(); form.resetFields(); }}
      footer={null}
      width={400}
      title={null}
    >
      <div style={{ padding: '16px 0 0' }}>
        {mode === 'reset' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setMode('login')} style={{ color: '#1677ff', padding: 0 }}>返回登录</Button>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>重置密码</div>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>输入注册邮箱，我们将发送密码重置链接</div>
            <Input prefix={<MailOutlined />} placeholder="your@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} size="large" style={{ marginBottom: 16 }} />
            <Button type="primary" onClick={handleResetPassword} loading={loading} block size="large">发送重置链接</Button>
          </div>
        ) : (
          <Tabs
            activeKey={mode}
            onChange={(key) => { setMode(key as 'login' | 'register'); form.resetFields(); }}
            centered
            items={tabItems}
          />
        )}
      </div>
    </Modal>
  );
}
