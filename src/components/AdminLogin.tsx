import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthModal from './AuthModal';

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部导航 */}
      <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={onBack}>
          返回首页
        </Button>
        <span style={{ fontSize: 16, fontWeight: 600, marginLeft: 16 }}>管理员登录</span>
      </div>

      {/* 认证弹窗始终打开，作为页面主体 */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ width: 420, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 24 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 24 }}>请使用管理员账号登录</h3>
          <AuthModal
            open={true}
            onClose={onBack}
            onLoginSuccess={onLoginSuccess}
            initialMode="login"
          />
        </div>
      </div>
    </div>
  );
}
