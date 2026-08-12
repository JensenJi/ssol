import { useState } from 'react';
import { Input, Button, Modal, Select, Drawer } from 'antd';
import { SearchOutlined, UserAddOutlined, UserOutlined, TeamOutlined, AimOutlined, EnvironmentOutlined, HomeOutlined, LockOutlined, LoginOutlined, LogoutOutlined, MenuOutlined, SettingOutlined } from '@ant-design/icons';
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
  isAdmin?: boolean;
  onGoHome?: () => void;
  showSlogan?: boolean;
}

export default function Navbar({ onSearch, onLocationUpdate, onDistanceSelect, onGoRegister, onGoLogin, onGoAdmin, onGoPersonal, onGoUsers, onLogout, ipLocation, isLoggedIn, isAdmin, onGoHome, showSlogan = true }: NavbarProps) {
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKeyword, setDialogKeyword] = useState('');
  const [dialogDistance, setDialogDistance] = useState(99999);
  const [menuOpen, setMenuOpen] = useState(false);
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
    if (manualProvince && onLocationUpdate) {
      const name = [manualProvince, manualCity, manualDistrict].filter(Boolean).join(' ');
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

  const handleMenuAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo区域 */}
        <div className="navbar-logo-group" onClick={onGoHome} style={{ cursor: 'pointer' }}>
          <div className="navbar-logo">
            <PushpinIcon size={24} color="#fff" className="logo-icon" />
            <div className="logo-text-group">
              <span className="logo-text logo-drive-in">搜索在线</span>
              <span className="logo-slogan" style={{ fontSize: 11, opacity: 0.85 }}>https://ssol.cn</span>
            </div>
          </div>
        </div>

        {/* 4个导航按钮：首页、搜索、登录、注册 */}
        <div className="navbar-actions navbar-desktop">
          <Button type="text" icon={<HomeOutlined />} onClick={onGoHome} className="nav-btn-sm">首页</Button>
          <Button type="text" icon={<SearchOutlined />} onClick={handleSearchClick} className="nav-btn-sm">搜索</Button>
          {isLoggedIn ? (
            <>
              <Button type="text" icon={<UserOutlined />} onClick={onGoPersonal} className="nav-btn-sm">我的</Button>
              {isAdmin && (
                <Button type="text" icon={<SettingOutlined />} onClick={onGoAdmin} className="nav-btn-sm" style={{ color: '#722ed1' }}>管理后台</Button>
              )}
              <Button type="text" icon={<LogoutOutlined />} onClick={onLogout} className="nav-btn-sm nav-btn-logout">退出</Button>
            </>
          ) : (
            <>
              <Button type="text" icon={<UserAddOutlined />} onClick={onGoRegister} className="nav-btn-sm nav-btn-register">注册</Button>
              <Button type="text" icon={<LoginOutlined />} onClick={onGoLogin} className="nav-btn-sm nav-btn-login">登录</Button>
            </>
          )}
        </div>

        {/* 手机端汉堡菜单 */}
        <div className="navbar-hamburger" onClick={() => setMenuOpen(true)}>
          <MenuOutlined style={{ fontSize: 20, color: '#333' }} />
        </div>
      </nav>

      {/* 手机端侧边菜单 */}
      <Drawer
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PushpinIcon size={22} color="#e53935" />
          <span style={{ fontWeight: 700, color: '#7179e9' }}>搜索在线</span>
        </div>}
        placement="right"
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
        width={240}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Button type="text" icon={<HomeOutlined />} onClick={() => handleMenuAction(() => onGoHome?.())} block style={{ justifyContent: 'flex-start', height: 44 }}>首页</Button>
          {isLoggedIn ? (
            <>
              <Button type="text" icon={<UserOutlined />} onClick={() => handleMenuAction(() => onGoPersonal?.())} block style={{ justifyContent: 'flex-start', height: 44 }}>个人中心</Button>
              {isAdmin && (
                <Button type="text" icon={<SettingOutlined />} onClick={() => handleMenuAction(() => onGoAdmin?.())} block style={{ justifyContent: 'flex-start', height: 44, color: '#722ed1' }}>管理后台</Button>
              )}
              <Button type="text" icon={<TeamOutlined />} onClick={() => handleMenuAction(() => onGoUsers?.())} block style={{ justifyContent: 'flex-start', height: 44 }}>用户管理</Button>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0' }} />
              <Button type="text" danger icon={<LogoutOutlined />} onClick={() => handleMenuAction(() => onLogout?.())} block style={{ justifyContent: 'flex-start', height: 44 }}>退出登录</Button>
            </>
          ) : (
            <>
              <div style={{ borderTop: '1px solid #f0f0f0', margin: '8px 0' }} />
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => handleMenuAction(() => onGoLogin?.())} block style={{ height: 44, borderRadius: 8 }}>注册 / 登录</Button>
            </>
          )}
        </div>
        {ipLocation && (
          <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, fontSize: 12, color: '#999' }}>
            <EnvironmentOutlined style={{ marginRight: 4, color: '#52c41a' }} />
            {ipLocation.name}
          </div>
        )}
      </Drawer>

      {/* 搜索设置弹窗 */}
      <Modal
        title={<span><AimOutlined style={{ color: '#1677ff', marginRight: 8 }} />搜索设置</span>}
        open={dialogOpen}
        onOk={handleDialogConfirm}
        onCancel={() => setDialogOpen(false)}
        okText="开始搜索"
        cancelText="取消"
        width={typeof window !== 'undefined' && window.innerWidth < 500 ? '92%' : 420}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
              <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 4 }} />
              我的位置
              {ipLocation && <span style={{ fontWeight: 400, color: '#52c41a', marginLeft: 8, fontSize: 12 }}>● 已定位</span>}
            </div>
            {ipLocation ? (
              <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', fontSize: 14 }}>
                {ipLocation.name}
              </div>
            ) : (
              <div style={{ background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 6, padding: '10px 14px', fontSize: 14, color: '#666' }}>
                定位中...请在下方手动更正
              </div>
            )}
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>位置不准确？请在下方手动更正</div>
          </div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Input placeholder="省" value={manualProvince} onChange={(e) => setManualProvince(e.target.value)} style={{ flex: 1 }} allowClear />
            <Input placeholder="市" value={manualCity} onChange={(e) => setManualCity(e.target.value)} style={{ flex: 1 }} allowClear />
            <Input placeholder="县/区" value={manualDistrict} onChange={(e) => setManualDistrict(e.target.value)} style={{ flex: 1 }} allowClear />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>我的关键词</div>
            <Input placeholder="如：英语、渐冻症、古琴修复..." value={dialogKeyword} onChange={(e) => setDialogKeyword(e.target.value)} allowClear />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              提示：英语也有门槛，PETS5以下或CET-6以下不被收录信息库，雅思托福可以等
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>距离</div>
            <Select value={dialogDistance} onChange={setDialogDistance} style={{ width: '100%' }} options={distanceData} />
          </div>
        </div>
      </Modal>

    </>
  );
}
