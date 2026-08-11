import { useState } from 'react';
import { Form, Input, Button, Card, message, Modal, Alert } from 'antd';
import { LockOutlined, MailOutlined, SettingOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AdminLoginProps {
  onBack: () => void;
  onLogin: (email?: string) => void;
}

const ADMIN_CREDENTIALS_KEY = 'ssol_admin_credentials';
const ADMIN_EMAILS_KEY = 'ssol_admin_emails';

// 默认管理员凭证（本地备用）
const DEFAULT_ADMIN = { username: 'admin', password: 'ssol2024' };

function getLocalAdmin() {
  try {
    const saved = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_ADMIN;
}

function getAdminEmails(): string[] {
  try {
    const saved = localStorage.getItem(ADMIN_EMAILS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function addAdminEmail(email: string) {
  const emails = getAdminEmails();
  const lower = email.toLowerCase();
  if (!emails.includes(lower)) {
    emails.push(lower);
    localStorage.setItem(ADMIN_EMAILS_KEY, JSON.stringify(emails));
  }
}

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
  const [pwdSetupOpen, setPwdSetupOpen] = useState(false);
  const [pwdSetupForm] = Form.useForm();

  const hasSupabase = isSupabaseConfigured;
  const hasAdminEmails = getAdminEmails().length > 0;
  const localAdmin = getLocalAdmin();

  // 本地管理员登录（备用方案）
  const handleLocalLogin = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));

      const creds = getLocalAdmin();
      if (values.username === creds.username && values.password === creds.password) {
        message.success('管理员登录成功');
        form.resetFields();
        onLogin();
      } else {
        message.error('账号或密码错误');
      }
    } catch { /* validation failed */ }
    finally { setLoading(false); }
  };

  // Supabase 邮箱登录
  const handleEmailLogin = async () => {
    if (!hasSupabase) { message.error('Supabase 未配置'); return; }
    try {
      const values = await form.validateFields();
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error(error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message);
        setLoading(false);
        return;
      }

      const email = data.user?.email || values.email;
      if (!isAdminEmail(email)) {
        message.warning('该邮箱未注册为管理员，请先设置为管理员');
        setupForm.setFieldsValue({ email });
        setSetupOpen(true);
        setLoading(false);
        return;
      }

      message.success('登录成功');
      form.resetFields();
      onLogin(email);
    } catch { /* validation failed */ }
    finally { setLoading(false); }
  };

  // 统一登录入口
  const handleLogin = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values) return;

    // 如果填的是邮箱格式，走 Supabase 登录
    if (values.email) {
      await handleEmailLogin();
    } else {
      await handleLocalLogin();
    }
  };

  // 设置管理员邮箱（Supabase 模式）
  const handleSetup = async () => {
    if (!hasSupabase) { message.error('Supabase 未配置'); return; }
    try {
      const values = await setupForm.validateFields();
      setSetupLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        message.error('邮箱或密码错误，请确认已注册账号');
        setSetupLoading(false);
        return;
      }

      const email = data.user?.email || values.email;
      addAdminEmail(email);
      message.success('管理员身份已设置，请用该邮箱登录');
      setSetupOpen(false);
      setupForm.resetFields();
      form.setFieldsValue({ email: values.email });
    } catch { /* validation failed */ }
    finally { setSetupLoading(false); }
  };

  // 修改本地管理员密码
  const handlePwdSetup = async () => {
    try {
      const values = await pwdSetupForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次密码不一致');
        return;
      }
      if (values.newPassword.length < 6) {
        message.error('密码至少6位');
        return;
      }
      localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify({
        username: values.newUsername || 'admin',
        password: values.newPassword,
      }));
      message.success('管理员账号已更新');
      setPwdSetupOpen(false);
      pwdSetupForm.resetFields();
      form.resetFields();
    } catch { /* validation failed */ }
  };

  // 忘记密码（Supabase 重置）
  const handleResetPassword = async () => {
    if (!resetEmail) { message.warning('请输入注册邮箱'); return; }
    if (!hasSupabase) { message.error('Supabase 未配置'); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    setResetLoading(false);
    if (error) { message.error(error.message); return; }
    message.success('重置链接已发送到邮箱');
    setResetOpen(false);
    setResetEmail('');
  };

  // 根据是否有 Supabase 和已注册管理员邮箱，决定显示哪种登录方式
  const useEmailLogin = hasSupabase && hasAdminEmails;

  return (
    <div className="register-page" style={{ paddingTop: 80 }}>
      <div className="register-container" style={{ maxWidth: 420 }}>
        <Card className="register-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            <h2 style={{ marginTop: 16, marginBottom: 8 }}>管理员登录</h2>
            <p style={{ color: '#999', fontSize: 13 }}>
              {useEmailLogin ? '使用注册邮箱和密码登录' : '请输入管理员账号和密码'}
            </p>
          </div>

          {/* 提示信息 */}
          {!hasSupabase && (
            <Alert
              type="info"
              message="Supabase 未配置，使用本地管理员账号"
              style={{ marginBottom: 16, fontSize: 12 }}
            />
          )}
          {hasSupabase && !hasAdminEmails && (
            <Alert
              type="warning"
              message="尚未设置管理员邮箱，请先点击下方「设置为管理员」"
              style={{ marginBottom: 16, fontSize: 12 }}
            />
          )}

          <Form form={form} layout="vertical" size="large">
            {useEmailLogin ? (
              <>
                <Form.Item name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
                  <Input prefix={<MailOutlined />} placeholder="注册邮箱" />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
                  <Input prefix={<UserOutlined />} placeholder="管理员账号" defaultValue="admin" />
                </Form.Item>
              </>
            )}
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Button type="primary" block onClick={handleLogin} loading={loading} style={{ marginTop: 8 }}>
              登录
            </Button>
          </Form>

          {/* 操作入口 */}
          <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hasSupabase && (
              <Button
                type="link"
                icon={<SettingOutlined />}
                onClick={() => setSetupOpen(true)}
                style={{ fontSize: 13 }}
              >
                设置为管理员（邮箱认证）
              </Button>
            )}
            <Button
              type="link"
              icon={<LockOutlined />}
              onClick={() => setPwdSetupOpen(true)}
              style={{ fontSize: 13 }}
            >
              修改管理员密码
            </Button>
            {hasSupabase && (
              <Button
                type="link"
                onClick={() => setResetOpen(true)}
                style={{ fontSize: 13 }}
              >
                忘记密码？邮箱重置
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 设置管理员邮箱弹窗 */}
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
            输入您的 Supabase 注册邮箱和密码，验证后将授予管理员权限。
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

      {/* 修改本地管理员密码弹窗 */}
      <Modal
        title={<span><LockOutlined style={{ color: '#1677ff', marginRight: 8 }} />修改管理员密码</span>}
        open={pwdSetupOpen}
        onCancel={() => { setPwdSetupOpen(false); pwdSetupForm.resetFields(); }}
        onOk={handlePwdSetup}
        okText="确认修改"
        cancelText="取消"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
            修改本地管理员账号和密码（不影响 Supabase 用户）。
          </p>
          <Form form={pwdSetupForm} layout="vertical" size="large" initialValues={{ newUsername: 'admin' }}>
            <Form.Item name="newUsername" label="管理员账号">
              <Input prefix={<UserOutlined />} placeholder="admin" />
            </Form.Item>
            <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="至少6位" />
            </Form.Item>
            <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true, message: '请再次输入' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="再次输入" />
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
            输入注册邮箱，我们将发送密码重置链接。
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
