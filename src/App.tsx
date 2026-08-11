import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ConfigProvider, message, Modal, Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import Navbar from './components/Navbar';
import MapContainer from './components/MapContainer';
import ResultTable from './components/ResultTable';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PersonalCenter from './components/PersonalCenter';
import UserManagement from './components/UserManagement';
import { userAPI, visitorAPI } from './lib/cloudbase';
import { mockDoctors, calculateDistance } from './data/mockData';
import type { Doctor } from './data/mockData';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import AuthModal from './components/AuthModal';
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('ssol_adminLoggedIn') === 'true';
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [favTarget, setFavTarget] = useState<Doctor | null>(null);
  const [deviceInfo] = useState(detectDeviceInfo);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Supabase 认证（只需要 signOut，AuthModal 内部自行处理 signUp/signIn/resetPassword）
  const { user: supabaseUser, configured: supabaseConfigured, signOut } = useSupabaseAuth();

  // Supabase 登录成功后同步状态
  useEffect(() => {
    if (supabaseUser && !isLoggedIn) {
      setIsLoggedIn(true);
      if (!currentUser) {
        setCurrentUser({
          id: supabaseUser.id,
          name: supabaseUser.displayName || supabaseUser.email.split('@')[0],
          keywords: [],
          likes: 0,
          verified: false,
        });
      }
    }
  }, [supabaseUser]);

  const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'personal' | 'users' | 'admin-login'>('home');
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
  const [tableExpanded, setTableExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 800);
  const [tableHeight, setTableHeight] = useState(200);
  const [ipLocation, setIpLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const dragRef = useRef<{ startY: number; startHeight: number; wasExpanded: boolean } | null>(null);

  // ==================== 管理员工具函数 ====================
  function isAdminEmail(email?: string): boolean {
    if (!email) return false;
    try {
      const emails = JSON.parse(localStorage.getItem('ssol_admin_emails') || '[]');
      return emails.includes(email.toLowerCase());
    } catch {
      return false;
    }
  }

  function addAdminEmail(email: string) {
    try {
      const emails = JSON.parse(localStorage.getItem('ssol_admin_emails') || '[]');
      const lower = email.toLowerCase();
      if (!emails.includes(lower)) {
        emails.push(lower);
        localStorage.setItem('ssol_admin_emails', JSON.stringify(emails));
      }
    } catch { /* ignore */ }
  }

  function getAdminEmails(): string[] {
    try {
      return JSON.parse(localStorage.getItem('ssol_admin_emails') || '[]');
    } catch {
      return [];
    }
  }

  // ==================== 持久化 ====================
  useEffect(() => { localStorage.setItem('ssol_loggedIn', String(isLoggedIn)); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('ssol_adminLoggedIn', String(isAdminLoggedIn)); }, [isAdminLoggedIn]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('ssol_currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('ssol_currentUser');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('ssol_pendingUsers', JSON.stringify(pendingUsers)); }, [pendingUsers]);
  useEffect(() => { localStorage.setItem('ssol_registeredUsers', JSON.stringify(registeredUsers)); }, [registeredUsers]);

  // 从云开发加载认证专家数据 + 初始化测试用户
  useEffect(() => {
    const loadData = async () => {
      try {
        const verifiedExperts = await userAPI.getVerifiedExperts();
        if (verifiedExperts && verifiedExperts.length > 0) {
          setExperts(verifiedExperts as Doctor[]);
        }
        const pending = await userAPI.getPendingUsers();
        if (pending) setPendingUsers(pending as Partial<Doctor>[]);
      } catch {
        console.log('使用本地模拟数据');
      }
    };
    loadData();

    // 初始化测试用户（仅首次）
    const testUserId = 'test-user-001';
    const existingUsers = JSON.parse(localStorage.getItem('ssol_registeredUsers') || '[]');
    if (!existingUsers.find((u: any) => u.id === testUserId)) {
      const testUser = {
        id: testUserId,
        name: '测试用户',
        email: 'test@ssol.cn',
        category: '医生',
        title: '测试医师',
        hospital: '测试医院',
        province: '北京',
        city: '北京',
        contact_phone: '13800138000',
        keywords: ['测试', '内科', '全科'],
        bio: '这是一个测试账号，用于测试所有用户功能。',
        likes: 0,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      setRegisteredUsers((prev) => [...prev, testUser]);
      setExperts((prev) => [...prev, { ...testUser, location_lat: 39.9, location_lng: 116.4, visible_range: 99999 } as unknown as Doctor]);
    }

    visitorAPI.recordVisit({ ...deviceInfo, url: window.location.href }).catch(() => {});
  }, []);

  // 尝试获取用户位置：浏览器GPS优先，备选IP定位
  useEffect(() => {
    let geoWatchId: number | null = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => { getIPLocation(); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      setTimeout(() => { if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId); }, 30000);
    } else {
      getIPLocation();
    }

    function reverseGeocode(lat: number, lng: number) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh&zoom=12`)
        .then((r) => r.json())
        .then((d) => {
          const addr = d.address || {};
          const name = [addr.state, addr.city || addr.town || addr.county, addr.suburb || addr.district].filter(Boolean).join(' ');
          if (name) { setIpLocation({ name, lat, lng }); setLocationName(name); }
        })
        .catch(() => { setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`); });
    }

    function getIPLocation() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      fetch('http://ip-api.com/json/?lang=zh-CN', { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (data && data.status === 'success' && data.lat && data.lon) {
            const name = [data.regionName, data.city, data.district].filter(Boolean).join(' ');
            setIpLocation({ name: name || '未知', lat: data.lat, lng: data.lon });
            setUserLocation({ lat: data.lat, lng: data.lon });
            setLocationName(name || '未知');
            return;
          }
          return fetch('https://ipapi.co/json/', { signal: controller.signal });
        })
        .then((res) => { if (!res) return; return res.json(); })
        .then((data) => {
          if (data && data.latitude && data.longitude) {
            const name = [data.region, data.city].filter(Boolean).join(' ');
            setIpLocation({ name: name || '未知', lat: data.latitude, lng: data.longitude });
            setUserLocation({ lat: data.latitude, lng: data.longitude });
            setLocationName(name || '未知');
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          setIpLocation({ name: '山东 济宁', lat: 35.41, lng: 116.52 });
          setUserLocation({ lat: 35.41, lng: 116.52 });
          setLocationName('山东 济宁');
        });
    }

    return () => { if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId); };
  }, []);

  // ==================== 管理后台入口 ====================
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#/admin-login') {
        setCurrentPage('admin-login');
      } else if (window.location.hash === '#/admin') {
        if (!isLoggedIn) {
          setAuthModalOpen(true);
        } else if (isAdminEmail(supabaseUser?.email)) {
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
        } else {
          // 已登录但非管理员：尝试设为管理员
          if (getAdminEmails().length === 0 && supabaseUser?.email) {
            addAdminEmail(supabaseUser.email);
            setIsAdminLoggedIn(true);
            setCurrentPage('admin');
            message.success('您已成为首位管理员');
          } else {
            message.warning('您没有管理员权限');
          }
        }
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (!isLoggedIn) {
          setAuthModalOpen(true);
        } else if (isAdminEmail(supabaseUser?.email)) {
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
        } else {
          if (getAdminEmails().length === 0 && supabaseUser?.email) {
            addAdminEmail(supabaseUser.email);
            setIsAdminLoggedIn(true);
            setCurrentPage('admin');
            message.success('您已成为首位管理员');
          } else {
            message.warning('您没有管理员权限');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoggedIn, supabaseUser]);

  // ==================== 搜索和交互 ====================
  const handleSearch = useCallback((keyword: string) => setSearchKeyword(keyword.trim()), []);
  const handleMapClick = useCallback((lat: number, lng: number) => setUserLocation({ lat, lng }), []);

  const handleLocationUpdate = useCallback((loc: { lat: number; lng: number; name: string }) => {
    setLocationName(loc.name);
    if (loc.lat > 0 && loc.lng > 0) {
      setUserLocation({ lat: loc.lat, lng: loc.lng });
      setIpLocation({ name: loc.name, lat: loc.lat, lng: loc.lng });
    } else if (loc.name) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc.name)}&format=json&limit=1&accept-language=zh`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (data && data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            if (!isNaN(newLat) && !isNaN(newLng)) {
              setUserLocation({ lat: newLat, lng: newLng });
              setIpLocation({ name: loc.name, lat: newLat, lng: newLng });
            }
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          setIpLocation({ name: loc.name, lat: 0, lng: 0 });
        });
    }
  }, []);

  const handleLocationName = useCallback((name: string) => setLocationName(name), []);
  const handleDistanceSelect = useCallback(() => {}, []);

  const handleFavorite = useCallback((doctor: Doctor) => {
    if (!isLoggedIn) { setFavTarget(doctor); setLoginModalOpen(true); return; }
    setFavorites((prev) => {
      if (prev.includes(doctor.id)) { message.info('已取消收藏'); return prev.filter((id) => id !== doctor.id); }
      message.success(`已收藏 ${doctor.name}`);
      return [...prev, doctor.id];
    });
  }, [isLoggedIn]);

  // ==================== 认证相关回调 ====================
  // 导航栏登录按钮
  const handleNavLogin = useCallback(() => {
    setAuthInitialMode('login');
    setAuthModalOpen(true);
  }, []);

  // 导航栏注册按钮
  const handleNavRegister = useCallback(() => {
    setAuthInitialMode('register');
    setAuthModalOpen(true);
  }, []);

  // 登录成功回调（AuthModal 中登录成功后触发）
  const handleLoginSuccess = useCallback((email: string) => {
    setAuthModalOpen(false);
    setIsLoggedIn(true);

    // 注册到本地用户记录（用于管理员后台查看）
    if (email) {
      const existingUser = registeredUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (!existingUser) {
        const newUserId = `user-${Date.now()}`;
        const newUser: Partial<Doctor> & { email?: string } = {
          id: newUserId,
          name: email.split('@')[0],
          keywords: [],
          likes: 0,
          verified: false,
          createdAt: new Date().toISOString(),
          email,
        };
        setRegisteredUsers((prev) => [...prev, newUser]);
        setCurrentUser(newUser);
      } else {
        setCurrentUser(existingUser);
      }
    }

    // 管理员判断：首位自动提升
    if (email) {
      const adminEmails = getAdminEmails();
      if (adminEmails.length === 0) {
        addAdminEmail(email);
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
        message.success('您已成为首位管理员，进入管理后台');
        return;
      }
      if (isAdminEmail(email)) {
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
        return;
      }
    }

    // 普通用户：进入个人中心，处理收藏
    setCurrentPage('personal');
    if (favTarget) { setFavorites((prev) => [...prev, favTarget.id]); message.success(`已收藏 ${favTarget.name}`); setFavTarget(null); }
  }, [favTarget, registeredUsers]);

  // 管理后台登录页成功回调
  const handleAdminLoginSuccess = useCallback((email: string) => {
    setIsLoggedIn(true);
    setIsAdminLoggedIn(true);
    addAdminEmail(email);
    
    // 注册到本地用户记录
    const existingUser = registeredUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existingUser) {
      const newUser: Partial<Doctor> & { email?: string } = {
        id: `admin-${Date.now()}`,
        name: email.split('@')[0],
        keywords: [],
        likes: 0,
        verified: false,
        createdAt: new Date().toISOString(),
        email,
      };
      setRegisteredUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
    } else {
      setCurrentUser(existingUser);
    }
    
    setCurrentPage('admin');
    message.success('登录成功，进入管理后台');
  }, [registeredUsers]);

  // ==================== 管理员操作 ====================
  const handleApprove = useCallback(async (id: string) => {
    try { await userAPI.approveUser(id); } catch { /* 本地模式 */ }
    message.success('已通过审核');
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
    setRegisteredUsers((prev) => prev.map((u) => u.id === id ? { ...u, verified: true } : u));
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

  const handleUpdateUser = useCallback((updatedUser: Partial<Doctor>) => {
    setRegisteredUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
    setPendingUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  const handleDeleteUser = useCallback((id: string) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // 导航栏"管理后台"按钮
  const handleGoAdmin = useCallback(() => {
    if (isAdminLoggedIn) {
      setCurrentPage('admin');
    } else if (isLoggedIn) {
      if (isAdminEmail(supabaseUser?.email)) {
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
      } else {
        const adminEmails = getAdminEmails();
        if (adminEmails.length === 0 && supabaseUser?.email) {
          addAdminEmail(supabaseUser.email);
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
          message.success('您已成为首位管理员');
        } else {
          message.warning('您没有管理员权限');
        }
      }
    } else {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
    }
  }, [isAdminLoggedIn, isLoggedIn, supabaseUser]);

  // 退出登录
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    localStorage.removeItem('ssol_loggedIn');
    localStorage.removeItem('ssol_currentUser');
    localStorage.removeItem('ssol_adminLoggedIn');
    if (supabaseConfigured) signOut();
    message.success('已退出登录');
  }, [supabaseConfigured, signOut]);

  const handleAdminLogout = useCallback(() => {
    setIsAdminLoggedIn(false);
    setCurrentPage('home');
    localStorage.removeItem('ssol_adminLoggedIn');
    message.success('已退出管理后台');
  }, []);

  const handleMarkerClick = useCallback((doctor: Doctor) => { setSelectedDoctor(doctor); setProfileOpen(true); }, []);
  const handleKeywordClick = useCallback((keyword: string) => {
    setProfileOpen(false);
    setSelectedDoctor(null);
    setSearchKeyword(keyword);
    setTableExpanded(true);
  }, []);

  // ==================== 数据处理 ====================
  const allKeywords = useMemo(() => {
    const freqMap = new Map<string, number>();
    experts.forEach((d) => d.keywords.forEach((k) => freqMap.set(k, (freqMap.get(k) || 0) + 1)));
    return Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]).map(([kw]) => kw);
  }, [experts]);

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

  // 表格拖拽调整高度
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const startH = tableExpanded ? tableHeight : 40;
    dragRef.current = { startY, startHeight: startH, wasExpanded: tableExpanded };
    const isTouch = 'touches' in e;

    const handleMove = (clientY: number) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - clientY;
      const newHeight = Math.max(40, dragRef.current.startHeight + delta);
      setTableHeight(newHeight);
      if (!dragRef.current.wasExpanded && newHeight > 50) setTableExpanded(true);
      if (dragRef.current.wasExpanded && newHeight <= 45) setTableExpanded(false);
    };

    if (isTouch) {
      const onTouchMove = (ev: TouchEvent) => { ev.preventDefault(); handleMove(ev.touches[0].clientY); };
      const onTouchEnd = () => {
        dragRef.current = null;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    } else {
      const onMouseMove = (ev: MouseEvent) => handleMove(ev.clientY);
      const onMouseUp = () => {
        dragRef.current = null;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    }
  }, [tableHeight, tableExpanded]);

  // ==================== 渲染 ====================
  return (
    <ConfigProvider locale={zhCN}>
      {/* 个人中心 */}
      {currentPage === 'personal' && currentUser && (
        <PersonalCenter
          onBack={() => setCurrentPage('home')}
          user={currentUser}
          favorites={favorites}
          allDoctors={experts}
          onUpdateUser={setCurrentUser}
        />
      )}

      {/* 用户管理 */}
      {currentPage === 'users' && (
        <UserManagement
          onBack={() => setCurrentPage('home')}
          allUsers={[...registeredUsers, ...pendingUsers.filter((u) => !registeredUsers.find((r) => r.id === u.id))]}
          experts={experts}
          favorites={favorites}
          onFavorite={handleFavorite}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {/* 管理后台 */}
      {currentPage === 'admin' && isAdminLoggedIn && (
        <>
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={handleNavRegister} onGoLogin={handleNavLogin}
            onGoHome={() => setCurrentPage('home')}
            onGoAdmin={() => setCurrentPage('admin')}
            onGoPersonal={() => setCurrentPage('personal')}
            onGoUsers={() => setCurrentPage('users')}
            onLogout={handleAdminLogout}
            ipLocation={ipLocation} isLoggedIn={true}
            isAdmin={true}
            showSlogan={false}
          />
          <AdminDashboard
            onBack={() => setCurrentPage('home')}
            pendingUsers={pendingUsers}
            registeredUsers={registeredUsers}
            onApprove={handleApprove}
            onReject={handleReject}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        </>
      )}

      {/* 管理员登录页 */}
      {currentPage === 'admin-login' && (
        <AdminLogin
          onBack={() => setCurrentPage('home')}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* 首页 */}
      {currentPage === 'home' && (
        <div className="app">
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={handleNavRegister} onGoLogin={handleNavLogin}
            onGoHome={() => setCurrentPage('home')}
            onGoAdmin={handleGoAdmin}
            onGoPersonal={() => setCurrentPage('personal')}
            onGoUsers={() => setCurrentPage('users')}
            onLogout={handleLogout}
            ipLocation={ipLocation} isLoggedIn={isLoggedIn}
            isAdmin={isAdminEmail(supabaseUser?.email)}
          />
          <div className="main-content">
            <div className="content-left full-width">
              <MapContainer
                doctors={filteredDoctors} selectedDoctor={selectedDoctor} userLocation={userLocation}
                locationName={locationName}
                onMapClick={handleMapClick} onMarkerClick={handleMarkerClick} onLocationName={handleLocationName}
              />
            </div>
            <div className={`result-table ${tableExpanded ? 'expanded' : 'collapsed'}`} style={{ height: tableExpanded ? tableHeight : 40 }}>
              <div className="drag-handle" onMouseDown={handleDragStart} onTouchStart={handleDragStart} title="拖动调整列表高度">
                <span style={{ fontSize: 11, color: '#999', userSelect: 'none' }}>{tableExpanded ? '▼ 收起列表' : '▲ 展开列表'}</span>
              </div>
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
          {/* 收藏需要登录提示 */}
          <Modal title="收藏需要登录" open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} onOk={() => { setLoginModalOpen(false); setAuthModalOpen(true); }} okText="登录" cancelText="取消">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <LoginOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
              <p>收藏功能需要先注册/登录</p>
              <p style={{ color: '#999', fontSize: 12 }}>请使用邮箱注册或登录</p>
            </div>
          </Modal>
        </div>
      )}

      {/* 统一认证弹窗（首页可访问） */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
      />
    </ConfigProvider>
  );
}

export default App;
