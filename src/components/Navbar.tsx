import { useState } from 'react';
import { Input, Button, Space, Modal, Select } from 'antd';
import { SearchOutlined, UserAddOutlined, UserOutlined, TeamOutlined, AimOutlined, EnvironmentOutlined, HomeOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import PushpinIcon from './PushpinIcon';

const distanceData = [
  { label: '5公里', value: 5 },
  { label: '10公里', value: 10 },
  { label: '50公里', value: 50 },
  { label: '100公里', value: 100 },
  { label: '500公里', value: 500 },
  { label: '全国', value: 99999 },
];

interface NavbarProps {
  onSearch: (keyword: string) => void;
  onLocationUpdate?: (location: { lat: number; lng: number; name: string }) => void;
  onDistanceSelect?: (distance: number) => void;
  onGoRegister?: () => void;
  onGoLogin?: () => void;
  onGoAdmin?: () => void;
  onGoPersonal?: () => void;
  onGoUsers?: () => void;
  onLogout?: () => void;
  ipLocation?: { name: string; lat: number; lng: number } | null;
  isLoggedIn?: boolean;
  onGoHome?: () => void;
  showSlogan?: boolean;
}

export default function Navbar({ onSearch, onLocationUpdate, onDistanceSelect, onGoRegister, onGoLogin, onGoAdmin, onGoPersonal, onGoUsers, onLogout, ipLocation, isLoggedIn, onGoHome, showSlogan = true }: NavbarProps) {
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKeyword, setDialogKeyword] = useState('');
  const [dialogDistance, setDialogDistance] = useState(99999);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // 手动更正位置
  const [manualProvince, setManualProvince] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');

  const handleSearchClick = () => {
    setDialogOpen(true);
    setDialogKeyword(keyword);
  };

  const handleDialogConfirm = () => {
    setKeyword(dialogKeyword);
    onSearch(dialogKeyword);
    // 如果手动填写了位置，使用手动位置
    if (manualProvince && onLocationUpdate) {
      const name = [manualProvince, manualCity, manualDistrict].filter(Boolean).join(' ');
      // 传递一个标记值，让 App 知道这是手动位置需要地理编码
      onLocationUpdate({ lat: -1, lng: -1, name });
    }
    if (onDistanceSelect) {
      onDistanceSelect(dialogDistance);
    }
    setDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <PushpinIcon size={32} color="#1677ff" className="logo-icon" />
          <div className="logo-text-group">
            <span className="logo-text logo-drive-in">搜索在线</span>
            <span className="logo-url">https://www.ssol.cn</span>
          </div>
          {showSlogan && <span className="logo-slogan">搜索在线，你手上的大型人才库。</span>}
        </div>
        <div className="navbar-center">
          <div className="navbar-search">
            <Input
              size="large"
              placeholder="你喜欢什么？搜一下！"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              onClick={handleSearchClick}
              style={{ width: 240, borderRadius: 8, cursor: 'pointer' }}
              allowClear
              readOnly
            />
          </div>
          <div className="navbar-actions">
            <Space size={8}>
              <Button type="primary" icon={<HomeOutlined />} onClick={onGoHome} className="nav-btn">首页</Button>
              {isLoggedIn ? (
                <>
                  <Button type="primary" icon={<UserOutlined />} onClick={onGoPersonal} className="nav-btn">个人中心</Button>
                  <Button type="primary" icon={<TeamOutlined />} onClick={onGoUsers} className="nav-btn">用户管理</Button>
                  <Button type="primary" icon={<LockOutlined />} onClick={onGoAdmin} className="nav-btn">管理后台</Button>
                  <Button type="primary" danger icon={<LogoutOutlined />} onClick={onLogout} className="nav-btn nav-btn-logout">退出</Button>
                </>
              ) : (
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAuthModalOpen(true)} className="nav-btn">注册/登录</Button>
              )}
            </Space>
          </div>
        </div>
      </nav>

      <Modal
        title={<span><AimOutlined style={{ color: '#1677ff', marginRight: 8 }} />搜索设置</span>}
        open={dialogOpen}
        onOk={handleDialogConfirm}
        onCancel={() => setDialogOpen(false)}
        okText="开始搜索"
        cancelText="取消"
        width={480}
      >
        <div style={{ padding: '8px 0' }}>
          {/* IP自动定位显示 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 4 }} />
              我的位置
              {ipLocation && <span style={{ fontWeight: 400, color: '#52c41a', marginLeft: 8, fontSize: 12 }}>● 已自动定位</span>}
            </div>
            {ipLocation ? (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', fontSize: 14 }}>
                {ipLocation.name}
              </div>
            ) : (
              <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 6, padding: '10px 14px', fontSize: 14, color: '#666' }}>
                北京（默认位置，请在下方手动更正）
              </div>
            )}
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>位置不准确？请在下方手动更正</div>
          </div>
          {/* 手动更正位置 */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Input
              placeholder="省"
              value={manualProvince}
              onChange={(e) => setManualProvince(e.target.value)}
              style={{ flex: 1 }}
              allowClear
            />
            <Input
              placeholder="市"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              style={{ flex: 1 }}
              allowClear
            />
            <Input
              placeholder="县/区"
              value={manualDistrict}
              onChange={(e) => setManualDistrict(e.target.value)}
              style={{ flex: 1 }}
              allowClear
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>我的关键词</div>
            <Input
              placeholder="如：英语、渐冻症、古琴修复..."
              value={dialogKeyword}
              onChange={(e) => setDialogKeyword(e.target.value)}
              allowClear
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              提示：英语也有门槛，PETS5以下或CET-6以下不被收录信息库，雅思托福可以等
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>距离</div>
            <Select
              value={dialogDistance}
              onChange={setDialogDistance}
              style={{ width: '100%' }}
              options={distanceData}
            />
          </div>
        </div>
      </Modal>

      {/* 注册/登录选择弹窗 */}
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        footer={null}
        width={360}
        title={null}
      >
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>请选择</div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => { setAuthModalOpen(false); onGoRegister?.(); }}
              style={{ width: 120, height: 48, fontSize: 16, borderRadius: 8 }}
            >
              注册
            </Button>
            <Button
              size="large"
              icon={<UserOutlined />}
              onClick={() => { setAuthModalOpen(false); onGoLogin?.(); }}
              style={{ width: 120, height: 48, fontSize: 16, borderRadius: 8 }}
            >
              登录
            </Button>
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 16 }}>注册过的用户请直接登录，无需重复注册</div>
        </div>
      </Modal>
    </>
  );
}
