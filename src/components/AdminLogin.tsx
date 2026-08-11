import { useState } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import { LockOutlined, MailOutlined, SettingOutlined, SafetyOutlined } from '@ant-design/icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

// 管理员邮箱白名单存储 key
const ADMIN_EMAILS_KEY = 'ssol_admin_emails';

// 获取管理员邮箱列表
function getAdminEmails(): string[] {
  try {
    const saved = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

// 添加管理员邮箱
function addAdminEmail(email: string) {
  const emails = getAdminEmails();
  const lower = email.toLowerCase();
  if (!emails.includes(lower)) {
    emails.push(lower);
    localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails));
  }
}

// 检查是否为管理员
function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.toLowerCase());
}

export default function AdminLogin({ onBack, onLogin }: AdminLoginProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupForm] = Form.useForm();
  const [setupLoading, setSetupLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleLogin = async () => {
    if (!isSupabaseConfigured) {
      message.error('请先配置 Supabase 认证服务');
      return;
    }
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 1. 通过 Supabase 验证邮箱和密码
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message);
        setLoading(false);
        return;
      }

      // 2. 密码正确，检查是否为注册的管理员
      const email = data.user?.email || values.email;
      if (!isAdminEmail(email)) {
        message.warning('该邮箱未注册为管理员，请先设置管理员身份');
        // 预填邮箱到设置弹窗
        setupForm.setFieldsValue({ email });
        setSetupOpen(true);
        setLoading(false);
        return;
      }

      message.success('登录成功');
      form.resetFields();
      onLogin();
    } catch {
      // 验证失败
    } finally {
      setLoading(false);
    }
  };

  // 设置管理员：需要先通过 Supabase 验证密码，再将邮箱加入白名单
  const handleSetup = async () => {
    if (!isSupabaseConfigured) {
      message.error('请先配置 Supabase 认证服务');
      return;
    }
    try {
      const values = await setupForm.validateFields();
      setSetupLoading(true);

      // 通过 Supabase 验证密码
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error('邮箱或密码错误，请确认您已注册账号');
        setSetupLoading(false);
        return;
      }

      // 验证成功，将邮箱加入管理员白名单
      const email = data.user?.email || values.email;
      addAdminEmail(email);
      message.success('管理员身份已设置成功，请登录');
      setSetupOpen(false);
      setupForm.resetFields();
      form.setFieldsValue({ email });
    } catch {
      // 验证失败
    } finally {
      setSetupLoading(false);
    }
  };

  // 忘记密码：通过 Supabase 发送重置邮件
  const handleResetPassword = async () => {
    if (!resetEmail) {
      message.warning('请输入注册邮箱');
      return;
    }
    if (!isSupabaseConfigured) {
      message.error('请先配置 Supabase 认证服务');
      return;
    }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setResetLoading(false);
    if (error) {
      message.error(error.message);
      return;
    }
    message.success('重置链接已发送到邮箱，请查收');
    setResetOpen(false);
    setResetEmail('');
  };

  return (
    <div className="register-page" style={{ paddingTop: 80 }}>
      <div className="register-container" style={{ maxWidth: 400 }}>
        <Card className="register-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            <h2 style={{ marginTop: 16, marginBottom: 8 }}>管理员登录</h2>
            <p style={{ color: '#999', fontSize: 13 }}>使用注册邮箱和密码登录管理后台</p>
          </div>

          <Form form={form} layout="vertical" size="large">
            <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input prefix={<MailOutlined />} placeholder="注册邮箱" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Button type="primary" block onClick={handleLogin} loading={loading} style={{ marginTop: 8 }}>
              登录
            </Button>
          </Form>

          {/* 操作入口 */}
          <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => setSetupOpen(true)}
              style={{ fontSize: 13 }}
            >
              首次使用？设置为管理员
            </Button>
            <Button
              type="link"
              onClick={() => setResetOpen(true)}
              style={{ fontSize: 13 }}
            >
              忘记密码？通过邮箱重置
            </Button>
          </div>
        </Card>
      </div>

      {/* 设置管理员弹窗 */}
      <Modal
        title={<span><SettingOutlined style={{ color: '#1677ff', marginRight: 8 }} />设置管理员身份</span>}
        open={setupOpen}
        onCancel={() => { setSetupOpen(false); setupForm.resetFields(); }}
        onOk={handleSetup}
        okText="确认设置"
        cancelText="取消"
        confirmLoading={setupLoading}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
            输入您的注册邮箱和密码，验证后将授予管理员权限。
          </p>
          <Form form={setupForm} layout="vertical" size="large">
            <Form.Item name="email" label="注册邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input prefix={<MailOutlined />} placeholder="your@email.com" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="注册时设置的密码" />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* 忘记密码弹窗 */}
      <Modal
        title={<span><LockOutlined style={{ color: '#1677ff', marginRight: 8 }} />重置密码</span>}
        open={resetOpen}
        onCancel={() => { setResetOpen(false); setResetEmail(''); }}
        onOk={handleResetPassword}
        okText="发送重置链接"
        cancelText="取消"
        confirmLoading={resetLoading}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
            输入注册邮箱，我们将发送密码重置链接到您的邮箱。
          </p>
          <Input
            prefix={<MailOutlined />}
            placeholder="your@email.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            size="large"
          />
        </div>
      </Modal>
    </div>
  );
}
