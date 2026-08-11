import { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ open, onClose, onLoginSuccess, initialMode = 'login' }: AuthModalProps) {
  const { signUp, signIn, resetPassword, configured } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [resetForm] = Form.useForm();

  // 每次打开弹窗时重置状态
  const handleOpen = (tab?: string) => {
    setActiveTab(tab || initialMode);
    setResetSent(false);
    loginForm.resetFields();
    registerForm.resetFields();
    resetForm.resetFields();
  };

  // 登录
  const handleLogin = async () => {
    try {
      const values = await loginForm.validateFields();
      setLoading(true);
      const { error } = await signIn(values.email, values.password);
      if (error) {
        const msg = error.message || '';
        if (msg.includes('Invalid login credentials') || msg.includes('Invalid')) {
          message.error('邮箱或密码错误，如未注册请先注册');
        } else {
          message.error(msg);
        }
      } else {
        message.success('登录成功');
        onLoginSuccess(values.email);
        onClose();
      }
    } catch {
      // 表单验证失败，不做处理
    } finally {
      setLoading(false);
    }
  };

  // 注册
  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      setLoading(true);
      const { error } = await signUp(values.email, values.password, values.displayName);
      if (error) {
        const msg = error.message || '';
        if (msg.includes('already registered') || msg.includes('already') || msg.includes('exists')) {
          message.warning('该邮箱已注册，请直接登录');
          loginForm.setFieldsValue({ email: values.email });
          loginForm.setFieldsValue({ password: '' });
          setActiveTab('login');
        } else if (msg.includes('检查邮箱')) {
          message.info('注册成功！请检查邮箱完成验证后再登录');
          loginForm.setFieldsValue({ email: values.email });
          loginForm.setFieldsValue({ password: '' });
          setActiveTab('login');
        } else {
          message.error(msg);
        }
      } else {
        message.success('注册成功，请登录');
        // 预填邮箱，切换到登录页
        loginForm.setFieldsValue({ email: values.email });
        loginForm.setFieldsValue({ password: '' });
        registerForm.resetFields();
        setActiveTab('login');
      }
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  // 重置密码
  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setLoading(true);
      const { error } = await resetPassword(values.email);
      if (error) {
        message.error(error.message);
      } else {
        setResetSent(true);
        message.success('密码重置邮件已发送，请检查邮箱');
      }
    } catch {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  // 登录 tab 的回车键
  const handleLoginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  const handleRegisterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRegister();
  };

  const handleResetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleResetPassword();
  };

  if (!configured) {
    return (
      <Modal open={open} onCancel={onClose} footer={null} title="提示">
        <div style={{ textAlign: 'center', padding: 32 }}>
          认证服务未配置，无法登录/注册
        </div>
      </Modal>
    );
  }

  const tabItems = [
    {
      key: 'login',
      label: '登录',
      children: (
        <Form form={loginForm} layout="vertical" onKeyDown={handleLoginKeyDown}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" block size="large" loading={loading} onClick={handleLogin} style={{ marginBottom: 12 }}>
            登录
          </Button>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => { setResetSent(false); resetForm.resetFields(); setActiveTab('reset'); }}>
              忘记密码？
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <Form form={registerForm} layout="vertical" onKeyDown={handleRegisterKeyDown}>
          <Form.Item name="displayName" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input prefix={<UserOutlined />} placeholder="昵称" size="large" />
          </Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱（必填）" size="large" autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" size="large" autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="confirmPassword" rules={[{ required: true, message: '请确认密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" autoComplete="new-password" />
          </Form.Item>
          <Button type="primary" block size="large" loading={loading} onClick={handleRegister}>
            注册
          </Button>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Button type="link" onClick={() => setActiveTab('login')}>
              已有账号？去登录
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'reset',
      label: '重置密码',
      children: resetSent ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>密码重置邮件已发送</p>
          <p style={{ color: '#999' }}>请前往邮箱查收并点击重置链接</p>
          <Button type="link" onClick={() => { setResetSent(false); resetForm.resetFields(); }}>
            重新发送
          </Button>
          <Button type="link" onClick={() => setActiveTab('login')}>
            返回登录
          </Button>
        </div>
      ) : (
        <Form form={resetForm} layout="vertical" onKeyDown={handleResetKeyDown}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入注册邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="请输入注册时使用的邮箱" size="large" autoComplete="email" />
          </Form.Item>
          <Button type="primary" block size="large" loading={loading} onClick={handleResetPassword} style={{ marginBottom: 12 }}>
            发送重置邮件
          </Button>
          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => setActiveTab('login')}>
              返回登录
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={420}
      afterOpenChange={(visible) => { if (visible) handleOpen(); }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setResetSent(false);
          if (key === 'login') loginForm.resetFields();
          if (key === 'register') registerForm.resetFields();
          if (key === 'reset') resetForm.resetFields();
        }}
        centered
        items={tabItems}
      />
    </Modal>
  );
}
