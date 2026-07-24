import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ConfigProvider, message, Modal, Button } from 'antd';
import { LoginOutlined, TableOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import Navbar from './components/Navbar';
import MapContainer from './components/MapContainer';
import ResultTable from './components/ResultTable';
import UserProfile from './components/UserProfile';
import RegisterPage from './components/RegisterPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PersonalCenter from './components/PersonalCenter';
import UserManagement from './components/UserManagement';
import { userAPI, visitorAPI } from './lib/cloudbase';
import { mockDoctors, calculateDistance } from './data/mockData';
import type { Doctor } from './data/mockData';
import './App.css';

// 检测设备信息
function detectDeviceInfo() {
  const ua = navigator.userAgent;
  let os = '未知', device = '电脑', browser = '未知';
  if (/Android/i.test(ua)) { os = 'Android'; device = '手机'; }
  else if (/iPhone|iPad|iPod/i.test(ua)) { os = 'iOS'; device = /iPad/i.test(ua) ? '平板' : '手机'; }
  else if (/Mac/i.test(ua)) { os = 'macOS'; }
  else if (/Windows/i.test(ua)) { os = 'Windows'; }
  else if (/Linux/i.test(ua)) { os = 'Linux'; }
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  return { os, device, browser };
}

function App() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('ssol_loggedIn') === 'true';
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favTarget, setFavTarget] = useState<Doctor | null>(null);
  const [deviceInfo] = useState(detectDeviceInfo);
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'admin' | 'adminLogin' | 'personal' | 'users'>('home');
  const [currentUser, setCurrentUser] = useState<Partial<Doctor> | null>(() => {
    const saved = localStorage.getItem('ssol_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [pendingUsers, setPendingUsers] = useState<Partial<Doctor>[]>(() => {
    const saved = localStorage.getItem('ssol_pendingUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [registeredUsers, setRegisteredUsers] = useState<Partial<Doctor>[]>(() => {
    const saved = localStorage.getItem('ssol_registeredUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [experts, setExperts] = useState<Doctor[]>(mockDoctors.filter(d => d.verified));
  const [tableExpanded, setTableExpanded] = useState(false);
  const [tableHeight, setTableHeight] = useState(200);
  const [ipLocation, setIpLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const dragRef = useRef<{ startY: number; startHeight: number; wasExpanded: boolean } | null>(null);

  // 登录状态持久化
  useEffect(() => {
    localStorage.setItem('ssol_loggedIn', String(isLoggedIn));
  }, [isLoggedIn]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('ssol_currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('ssol_currentUser');
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('ssol_pendingUsers', JSON.stringify(pendingUsers));
  }, [pendingUsers]);
  useEffect(() => {
    localStorage.setItem('ssol_registeredUsers', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // 从云开发加载认证专家数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const verifiedExperts = await userAPI.getVerifiedExperts();
        if (verifiedExperts && verifiedExperts.length > 0) {
          setExperts(verifiedExperts as Doctor[]);
        }
        // 加载待审核用户
        const pending = await userAPI.getPendingUsers();
        if (pending) {
          setPendingUsers(pending as Partial<Doctor>[]);
        }
      } catch (error) {
        console.log('使用本地模拟数据');
      }
    };
    loadData();

    // 记录访客
    visitorAPI.recordVisit({
      ...deviceInfo,
      url: window.location.href,
    }).catch(() => {});
  }, []);

  // 尝试获取用户位置：优先IP定位，备选GPS
  useEffect(() => {
    // 设置默认位置，避免显示"正在获取"
    setLocationName('北京');
    setUserLocation({ lat: 39.9042, lng: 116.4074 });

    // 通过IP自动定位（带超时）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timeoutId);
        if (data.latitude && data.longitude) {
          const name = [data.region, data.city, data.district].filter(Boolean).join(' ');
          setIpLocation({ name, lat: data.latitude, lng: data.longitude });
          setUserLocation({ lat: data.latitude, lng: data.longitude });
          setLocationName(name || '北京');
        }
      })
      .catch(() => {
        clearTimeout(timeoutId);
        // IP定位失败，尝试GPS
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => { /* 用户拒绝定位，使用默认北京 */ }
          );
        }
      });

    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  // 隐藏的管理后台入口：URL hash 或快捷键 Ctrl+Shift+A
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#/admin') {
        setCurrentPage('adminLogin');
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setCurrentPage('adminLogin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearch = useCallback((keyword: string) => setSearchKeyword(keyword.trim()), []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const handleLocationUpdate = useCallback((loc: { lat: number; lng: number; name: string }) => {
    setLocationName(loc.name);
    if (loc.lat && loc.lng) {
      setUserLocation({ lat: loc.lat, lng: loc.lng });
    }
  }, []);

  const handleLocationName = useCallback((name: string) => {
    setLocationName(name);
  }, []);

  const handleDistanceSelect = useCallback((_distance: number) => {
    // 距离筛选通过搜索对话框传递，这里保留接口
  }, []);

  const handleFavorite = useCallback((doctor: Doctor) => {
    if (!isLoggedIn) { setFavTarget(doctor); setLoginModalOpen(true); return; }
    setFavorites((prev) => {
      if (prev.includes(doctor.id)) { message.info('已取消收藏'); return prev.filter((id) => id !== doctor.id); }
      message.success(`已收藏 ${doctor.name}`);
      return [...prev, doctor.id];
    });
  }, [isLoggedIn]);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
    setLoginModalOpen(false);
    // 如果还没有当前用户信息，创建一个默认用户
    if (!currentUser) {
      const defaultUser: Partial<Doctor> = {
        id: `user-${Date.now()}`,
        name: '我的昵称',
        keywords: [],
        likes: 0,
        verified: false,
      };
      setCurrentUser(defaultUser);
    }
    if (favTarget) { setFavorites((prev) => [...prev, favTarget.id]); message.success(`已收藏 ${favTarget.name}`); setFavTarget(null); }
  }, [favTarget, currentUser]);

  const allKeywords = useMemo(() => {
    const freqMap = new Map<string, number>();
    experts.forEach((d) => d.keywords.forEach((k) => freqMap.set(k, (freqMap.get(k) || 0) + 1)));
    // 按频率降序排序
    return Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([kw]) => kw);
  }, [experts]);

  // 搜索结果：先匹配关键词，再按距离排序
  const filteredDoctors = useMemo(() => {
    let results = experts;
    const center = userLocation || { lat: 39.9042, lng: 116.4074 };
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      results = results.filter((d) =>
        d.name.toLowerCase().includes(kw) || d.keywords.some((k) => k.toLowerCase().includes(kw)) ||
        d.hospital.toLowerCase().includes(kw) || d.bio.toLowerCase().includes(kw)
      );
    }
    results.sort((a, b) =>
      calculateDistance(center.lat, center.lng, a.location_lat, a.location_lng) -
      calculateDistance(center.lat, center.lng, b.location_lat, b.location_lng)
    );
    return results;
  }, [searchKeyword, userLocation, experts]);

  const handleRegister = useCallback(async (user: Partial<Doctor>) => {
    const userData = {
      ...user,
      id: user.id || `user-${Date.now()}`,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    try {
      // 尝试云数据库
      await userAPI.register(userData);
      message.success('注册申请已提交，等待管理员审核');
    } catch {
      // 云数据库不可用，使用本地存储
      console.log('云数据库不可用，使用本地存储');
    }
    // 无论云数据库是否成功，都保存到本地
    setPendingUsers((prev) => {
      if (prev.find((u) => u.id === userData.id)) return prev;
      return [...prev, userData];
    });
    setRegisteredUsers((prev) => {
      if (prev.find((u) => u.id === userData.id)) return prev;
      return [...prev, userData];
    });
    // 注册成功后自动登录并跳转个人中心
    setIsLoggedIn(true);
    setCurrentUser(userData);
    setCurrentPage('personal');
  }, []);

  const handleApprove = useCallback(async (id: string) => {
    try { await userAPI.approveUser(id); } catch { /* 本地模式 */ }
    message.success('已通过审核');
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    setRegisteredUsers((prev) => prev.map((u) => u.id === id ? { ...u, verified: true } : u));
    // 将已通过的用户加入专家列表
    const approved = registeredUsers.find((u) => u.id === id);
    if (approved) {
      setExperts((prev) => {
        if (prev.find((e) => e.id === id)) return prev;
        return [...prev, { ...approved, location_lat: 39.9, location_lng: 116.4 } as Doctor];
      });
    }
  }, [registeredUsers]);

  const handleReject = useCallback(async (id: string) => {
    try { await userAPI.rejectUser(id); } catch { /* 本地模式 */ }
    message.info('已拒绝申请');
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    localStorage.removeItem('ssol_loggedIn');
    localStorage.removeItem('ssol_currentUser');
    message.success('已退出登录');
  }, []);

  const handleAdminLogin = useCallback(() => {
    setCurrentPage('admin');
  }, []);

  const handleMarkerClick = useCallback((doctor: Doctor) => { setSelectedDoctor(doctor); setProfileOpen(true); }, []);
  const handleKeywordClick = useCallback((keyword: string) => {
    setProfileOpen(false);
    setSelectedDoctor(null);
    setSearchKeyword(keyword);
    setTableExpanded(true);
  }, []);

  // 表格拖拽调整高度：上拉不限高度，下拉最小留一行(~40px)
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startH = tableExpanded ? tableHeight : 40;
    // 用ref存储初始状态，避免闭包捕获过期值
    dragRef.current = { startY: e.clientY, startHeight: startH, wasExpanded: tableExpanded };
    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const newHeight = Math.max(40, dragRef.current.startHeight + delta);
      setTableHeight(newHeight);
      // 用ref中的初始状态判断，而非闭包中的过期state
      if (!dragRef.current.wasExpanded && newHeight > 50) {
        setTableExpanded(true);
      }
      if (dragRef.current.wasExpanded && newHeight <= 45) {
        setTableExpanded(false);
      }
    };
    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  }, [tableHeight, tableExpanded]);

  return (
    <ConfigProvider locale={zhCN}>
      {currentPage === 'register' && (
        <>
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={() => {}} onGoHome={() => setCurrentPage('home')}
            onGoAdmin={() => setCurrentPage('adminLogin')}
            onGoPersonal={() => setCurrentPage('personal')}
            onGoUsers={() => setCurrentPage('users')}
            onLogout={handleLogout}
            ipLocation={ipLocation} isLoggedIn={isLoggedIn}
          />
          <RegisterPage onBack={() => setCurrentPage('home')} onRegister={handleRegister} ipLocation={ipLocation} />
        </>
      )}
      {currentPage === 'personal' && currentUser && (
        <PersonalCenter
          onBack={() => setCurrentPage('home')}
          user={currentUser}
          favorites={favorites}
          allDoctors={experts}
          onUpdateUser={setCurrentUser}
        />
      )}
      {currentPage === 'users' && (
        <UserManagement
          onBack={() => setCurrentPage('home')}
          allUsers={[...registeredUsers, ...pendingUsers.filter((u) => !registeredUsers.find((r) => r.id === u.id))]}
          experts={experts}
          favorites={favorites}
          onFavorite={handleFavorite}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'adminLogin' && (
        <>
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={() => {}} onGoHome={() => setCurrentPage('home')}
            ipLocation={ipLocation} isLoggedIn={isLoggedIn}
            onGoAdmin={() => setCurrentPage('adminLogin')}
            onLogout={handleLogout}
          />
          <AdminLogin onBack={() => setCurrentPage('home')} onLogin={handleAdminLogin} />
        </>
      )}
      {currentPage === 'admin' && (
        <>
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={() => {}} onGoHome={() => setCurrentPage('home')}
            ipLocation={ipLocation} isLoggedIn={true}
            onGoAdmin={() => setCurrentPage('adminLogin')}
            onLogout={handleLogout}
          />
          <AdminDashboard onBack={() => setCurrentPage('home')} pendingUsers={pendingUsers} registeredUsers={registeredUsers} onApprove={handleApprove} onReject={handleReject} />
        </>
      )}
      {currentPage === 'home' && (
        <div className="app">
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={() => setCurrentPage('register')}
            onGoHome={() => setCurrentPage('home')}
            onGoAdmin={() => setCurrentPage('adminLogin')}
            onGoPersonal={() => setCurrentPage('personal')}
            onGoUsers={() => setCurrentPage('users')}
            onLogout={handleLogout}
            ipLocation={ipLocation} isLoggedIn={isLoggedIn}
          />
        <div className="main-content">
          <div className="content-left full-width">
            <MapContainer
              doctors={filteredDoctors} selectedDoctor={selectedDoctor} userLocation={userLocation}
              locationName={locationName}
              onMapClick={handleMapClick} onMarkerClick={handleMarkerClick} onLocationName={handleLocationName}
            />
          </div>
          {/* 结果列表 */}
          <div className={`result-table ${tableExpanded ? 'expanded' : 'collapsed'}`} style={{ height: tableExpanded ? tableHeight : 40 }}>
            <div className="drag-handle" onMouseDown={handleDragStart} title="拖动调整列表高度" />
            {tableExpanded && (
              <div className="result-table-content">
                <ResultTable doctors={filteredDoctors} onRowClick={handleMarkerClick} favorites={favorites} onFavorite={handleFavorite} />
              </div>
            )}
          </div>
        </div>
        <UserProfile
          user={selectedDoctor} open={profileOpen} onClose={() => setProfileOpen(false)}
          isFavorited={selectedDoctor ? favorites.includes(selectedDoctor.id) : false}
          onFavorite={() => selectedDoctor && handleFavorite(selectedDoctor)} isLoggedIn={isLoggedIn}
        />
        <Modal title="收藏需要登录" open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} onOk={handleLogin} okText="登录" cancelText="取消">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <LoginOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
            <p>收藏功能需要先注册/登录</p>
            <p style={{ color: '#999', fontSize: 12 }}>（MVP演示：点击「登录」即可）</p>
          </div>
        </Modal>
        </div>
      )}
    </ConfigProvider>
  );
}

export default App;
