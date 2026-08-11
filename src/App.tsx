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
  const [adminSetupOpen, setAdminSetupOpen] = useState(false);
  const needAdminSetupRef = useRef(false);

  // Supabase 认证
  const { user: supabaseUser, configured: supabaseConfigured, signUp, signIn, signOut, resetPassword } = useSupabaseAuth();

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
  const [currentPage, setCurrentPage] = useState<'home' | 'register' | 'admin' | 'personal' | 'users'>('home');
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

  // 检查是否为管理员
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

  // 登录状态持久化
  useEffect(() => {
    localStorage.setItem('ssol_loggedIn', String(isLoggedIn));
  }, [isLoggedIn]);
  useEffect(() => {
    localStorage.setItem('ssol_adminLoggedIn', String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);
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

  // 从云开发加载认证专家数据 + 初始化测试用户
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

    // 记录访客
    visitorAPI.recordVisit({
      ...deviceInfo,
      url: window.location.href,
    }).catch(() => {});
  }, []);

  // 尝试获取用户位置：浏览器GPS优先，备选IP定位
  useEffect(() => {
    let geoWatchId: number | null = null;

    // 方案1：浏览器 watchPosition（最精准，GPS可达5米内）
    if (navigator.geolocation) {
      // 先用 getCurrentPosition 快速拿一个结果
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => { /* GPS失败，走IP */ getIPLocation(); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // 同时用 watchPosition 持续优化精度（30秒后自动停止）
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => { /* ignore watch errors */ },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      setTimeout(() => {
        if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
      }, 30000);
    } else {
      getIPLocation();
    }

    // 反向地理编码：坐标→地名
    function reverseGeocode(lat: number, lng: number) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh&zoom=12`)
        .then((r) => r.json())
        .then((d) => {
          const addr = d.address || {};
          const name = [addr.state, addr.city || addr.town || addr.county, addr.suburb || addr.district].filter(Boolean).join(' ');
          if (name) {
            setIpLocation({ name, lat, lng });
            setLocationName(name);
          }
        })
        .catch(() => {
          setLocationName(`${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        });
    }

    // 方案2：IP定位（多API降级，精确到城市级）
    function getIPLocation() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // 1) ip-api.com（免费，无需key，中国城市级准确）
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
            return;
          }
          return fetch('https://api.ip.sb/geoip', { signal: controller.signal });
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
          console.log('IP定位全部失败');
          // 全部失败时默认设为山东济宁（汶上县所属地级市）
          setIpLocation({ name: '山东 济宁', lat: 35.41, lng: 116.52 });
          setUserLocation({ lat: 35.41, lng: 116.52 });
          setLocationName('山东 济宁');
        });
    }

    return () => {
      if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
    };
  }, []);

  // 隐藏的管理后台入口：URL hash 或快捷键 Ctrl+Shift+A
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash === '#/admin') {
        if (!isLoggedIn) {
          setAuthModalOpen(true);
        } else if (isAdminEmail(supabaseUser?.email)) {
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
        } else {
          setAdminSetupOpen(true);
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
          setAdminSetupOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoggedIn, supabaseUser]);

  const handleSearch = useCallback((keyword: string) => setSearchKeyword(keyword.trim()), []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const handleLocationUpdate = useCallback((loc: { lat: number; lng: number; name: string }) => {
    setLocationName(loc.name);
    // 如果有有效坐标（非0非-1），直接使用
    if (loc.lat > 0 && loc.lng > 0) {
      setUserLocation({ lat: loc.lat, lng: loc.lng });
      // 同步更新 ipLocation，让搜索弹窗显示纠正后的位置
      setIpLocation({ name: loc.name, lat: loc.lat, lng: loc.lng });
    } else if (loc.name) {
      // 手动位置：通过Nominatim地理编码获取坐标（带超时保护）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc.name)}&format=json&limit=1&accept-language=zh`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (data && data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            if (!isNaN(newLat) && !isNaN(newLng)) {
              setUserLocation({ lat: newLat, lng: newLng });
              // 同步更新 ipLocation，让搜索弹窗显示纠正后的位置
              setIpLocation({ name: loc.name, lat: newLat, lng: newLng });
            }
          }
        })
        .catch(() => {
          clearTimeout(timeoutId);
          // 地理编码失败，仍然显示用户纠正的位置名称
          setIpLocation({ name: loc.name, lat: 0, lng: 0 });
          console.log('地理编码失败，使用位置名称:', loc.name);
        });
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

  // 导航栏登录按钮：Supabase配置时打开邮箱登录弹窗，否则直接登录
  const handleNavLogin = useCallback(() => {
    if (supabaseConfigured) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
    } else {
      setIsLoggedIn(true);
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
      message.success('登录成功');
    }
  }, [currentUser, supabaseConfigured]);

  // 导航栏注册按钮：打开 Supabase 注册弹窗（注册标签页）
  const handleNavRegister = useCallback(() => {
    setAuthInitialMode('register');
    setAuthModalOpen(true);
  }, []);

  // Supabase 登录/注册成功回调
  const handleAuthSuccess = useCallback((email?: string, isRegister?: boolean) => {
    setAuthModalOpen(false);
    setIsLoggedIn(true);

    // 注册时：创建本地用户记录，供管理员在后台查看和审核
    if (isRegister && email) {
      const newUserId = `user-${Date.now()}`;
      const newUser = {
        id: newUserId,
        name: email.split('@')[0],
        keywords: [],
        likes: 0,
        verified: false,
        createdAt: new Date().toISOString(),
      } as Partial<Doctor>;
      (newUser as any).email = email;
      setPendingUsers((prev) => prev.find((u) => u.id === newUserId) ? prev : [...prev, newUser]);
      setRegisteredUsers((prev) => prev.find((u) => u.id === newUserId) ? prev : [...prev, newUser]);
      setCurrentUser(newUser);
    }

    // 管理员自动识别与首次提升
    if (email) {
      const adminEmails = getAdminEmails();
      if (adminEmails.length === 0) {
        // 首次设置：无管理员时自动提升当前用户
        addAdminEmail(email);
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
        needAdminSetupRef.current = false;
        message.success('您已成为首位管理员，进入管理后台');
        return;
      }
      if (isAdminEmail(email)) {
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
        needAdminSetupRef.current = false;
        return;
      }
      if (needAdminSetupRef.current) {
        addAdminEmail(email);
        setIsAdminLoggedIn(true);
        setCurrentPage('admin');
        needAdminSetupRef.current = false;
        message.success('管理员身份已设置，进入管理后台');
        return;
      }
    }

    // 普通用户：进入个人中心
    setCurrentPage('personal');
    if (favTarget) { setFavorites((prev) => [...prev, favTarget.id]); message.success(`已收藏 ${favTarget.name}`); setFavTarget(null); }
  }, [favTarget]);

  // 设置为管理员（通过统一登录后自动触发）
  const handleAdminSetup = useCallback(async () => {
    setAdminSetupOpen(false);
    if (supabaseUser?.email) {
      // Supabase 已登录，直接设置
      addAdminEmail(supabaseUser.email);
      setIsAdminLoggedIn(true);
      setCurrentPage('admin');
      message.success('管理员身份已设置，进入管理后台');
    } else {
      // Supabase 未登录，先打开登录弹窗，登录后自动完成设置
      needAdminSetupRef.current = true;
      setAuthModalOpen(true);
    }
  }, [supabaseUser]);

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

  // 用户管理：更新用户信息
  const handleUpdateUser = useCallback((updatedUser: Partial<Doctor>) => {
    setRegisteredUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
    setPendingUsers((prev) => prev.map((u) => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  // 用户管理：删除用户
  const handleDeleteUser = useCallback((id: string) => {
    setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
    setPendingUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

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

  const handleAdminLogin = useCallback((email?: string) => {
    setIsAdminLoggedIn(true);
    // 确保 currentUser 存在
    setCurrentUser((prev) => prev || {
      id: `admin-user-${Date.now()}`,
      name: '管理员',
      keywords: [],
      likes: 0,
      verified: false,
    });
    setCurrentPage('admin');
  }, []);

  // 导航栏点击"管理后台"
  const handleGoAdmin = useCallback(() => {
    if (isAdminLoggedIn) {
      setCurrentPage('admin');
    } else if (isLoggedIn) {
      // 已登录但非管理员：检查是否为首次设置
      const adminEmails = getAdminEmails();
      if (adminEmails.length === 0) {
        // 无管理员，自动提升当前用户
        if (supabaseUser?.email) {
          addAdminEmail(supabaseUser.email);
          setIsAdminLoggedIn(true);
          setCurrentPage('admin');
          message.success('您已成为首位管理员，进入管理后台');
        } else {
          setAdminSetupOpen(true);
        }
      } else {
        setAdminSetupOpen(true);
      }
    } else {
      setAuthModalOpen(true);
    }
  }, [isAdminLoggedIn, isLoggedIn, supabaseUser]);

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

  // 表格拖拽调整高度：支持鼠标和触摸（手机）
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
      const onTouchMove = (ev: TouchEvent) => {
        ev.preventDefault();
        handleMove(ev.touches[0].clientY);
      };
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

  return (
    <ConfigProvider locale={zhCN}>
      {currentPage === 'register' && (
        <>
          <Navbar
            onSearch={handleSearch} onLocationUpdate={handleLocationUpdate} onDistanceSelect={handleDistanceSelect}
            onGoRegister={handleNavRegister} onGoLogin={handleNavLogin} onGoHome={() => setCurrentPage('home')}
            onGoAdmin={handleGoAdmin}
            onGoPersonal={() => setCurrentPage('personal')}
            onGoUsers={() => setCurrentPage('users')}
            onLogout={handleLogout}
            ipLocation={ipLocation} isLoggedIn={isLoggedIn}
            isAdmin={isAdminEmail(supabaseUser?.email)}
          />
          <RegisterPage onBack={() => setCurrentPage('home')} onRegister={handleRegister} onGoLogin={handleNavLogin} ipLocation={ipLocation} />
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
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
        />
      )}
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
          <AdminDashboard onBack={() => setCurrentPage('home')} pendingUsers={pendingUsers} registeredUsers={registeredUsers} onApprove={handleApprove} onReject={handleReject} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />
        </>
      )}
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
          {/* 结果列表 */}
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
        <Modal title="收藏需要登录" open={loginModalOpen} onCancel={() => setLoginModalOpen(false)} onOk={() => { setLoginModalOpen(false); if (supabaseConfigured) setAuthModalOpen(true); else handleLogin(); }} okText="登录" cancelText="取消">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <LoginOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
            <p>收藏功能需要先注册/登录</p>
            {supabaseConfigured ? <p style={{ color: '#999', fontSize: 12 }}>请使用邮箱注册或登录</p> : <p style={{ color: '#999', fontSize: 12 }}>（MVP演示：点击「登录」即可）</p>}
          </div>
        </Modal>
        </div>
      )}

      {/* Supabase 统一登录弹窗 */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={signIn}
        onRegister={signUp}
        onResetPassword={resetPassword}
        onSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />
      {/* 管理员身份设置弹窗 */}
      <Modal
        title="设置为管理员"
        open={adminSetupOpen}
        onCancel={() => setAdminSetupOpen(false)}
        onOk={handleAdminSetup}
        okText="确认设置"
        cancelText="取消"
      >
        <div style={{ padding: '16px 0' }}>
          <p>您的账号 <strong>{supabaseUser?.email}</strong> 尚未设置为管理员。</p>
          <p style={{ color: '#666' }}>点击"确认设置"后，该账号将获得管理员权限，可以管理网站后台。</p>
        </div>
      </Modal>
    </ConfigProvider>
  );
}

export default App;
