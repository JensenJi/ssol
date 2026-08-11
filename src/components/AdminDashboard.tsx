import { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Input, Tabs, Modal, Form, message, Descriptions, Alert } from 'antd';
import {
  DashboardOutlined, UserAddOutlined, UserOutlined, EyeOutlined,
  SafetyCertificateOutlined,
  CheckOutlined, CloseOutlined,
  KeyOutlined, LockOutlined, EyeOutlined as EyeIcon,
  WarningOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const { Title, Text } = Typography;

interface AdminDashboardProps {
  onBack: () => void;
  pendingUsers: Partial<Doctor>[];
  registeredUsers: Partial<Doctor>[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// 模拟访客统计数据
const visitorStats = {
  today: 1286,
  yesterday: 1152,
  thisWeek: 8934,
  thisMonth: 35672,
};

// 模拟设备统计
const deviceStats = [
  { name: 'Windows', count: 680, percent: 52.9 },
  { name: 'macOS', count: 245, percent: 19.0 },
  { name: 'Android', count: 198, percent: 15.4 },
  { name: 'iOS', count: 132, percent: 10.3 },
  { name: 'Linux', count: 31, percent: 2.4 },
];

// 模拟地区统计
const regionStats = [
  { name: '北京', count: 186 },
  { name: '上海', count: 152 },
  { name: '广东', count: 134 },
  { name: '浙江', count: 98 },
  { name: '江苏', count: 87 },
  { name: '山东', count: 76 },
  { name: '四川', count: 65 },
  { name: '湖北', count: 54 },
  { name: '其他', count: 434 },
];

// 违规词检测列表
const VIOLATION_WORDS = [
  '赌博', '色情', '暴力', '毒品', '诈骗', '传销', '邪教', '恐怖',
  '反动', '分裂', '颠覆', '暴乱', '走私', '贩毒', '卖淫', '娼',
  '枪支', '弹药', '爆炸', '假币', '洗钱', '非法集资', '高利贷',
];

// 检测文本中的违规词
function checkViolation(text: string): string[] {
  if (!text) return [];
  return VIOLATION_WORDS.filter((w) => text.includes(w));
}

// 检测图片URL是否可疑（简单检测）
function checkPhotoViolation(photo: string): boolean {
  if (!photo) return false;
  // 检查是否为base64图片（正常）或外部链接
  if (photo.startsWith('data:image')) return false;
  // 外部链接标记为需要人工检查
  return photo.startsWith('http');
}

export default function AdminDashboard({ onBack, pendingUsers, registeredUsers, onApprove, onReject }: AdminDashboardProps) {
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const [detailUser, setDetailUser] = useState<Partial<Doctor> | null>(null);
  const [detailViolations, setDetailViolations] = useState<{ field: string; words: string[] }[]>([]);
  const [photoWarning, setPhotoWarning] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [editUser, setEditUser] = useState<Partial<Doctor> | null>(null);
  const [editForm] = Form.useForm();

  const handleViewDetail = (user: Partial<Doctor>) => {
    setDetailUser(user);
    // 检测违规
    const violations: { field: string; words: string[] }[] = [];
    if (user.name) {
      const v = checkViolation(user.name);
      if (v.length) violations.push({ field: '姓名', words: v });
    }
    if (user.bio) {
      const v = checkViolation(user.bio);
      if (v.length) violations.push({ field: '自我介绍', words: v });
    }
    if (user.keywords) {
      const v = user.keywords.flatMap((k) => checkViolation(k));
      if (v.length) violations.push({ field: '关键词', words: [...new Set(v)] });
    }
    if (user.hospital) {
      const v = checkViolation(user.hospital);
      if (v.length) violations.push({ field: '工作单位', words: v });
    }
    if (user.title) {
      const v = checkViolation(user.title);
      if (v.length) violations.push({ field: '职称', words: v });
    }
    setDetailViolations(violations);
    setPhotoWarning(checkPhotoViolation((user as any).photo || ''));
  };

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      if (values.newPassword.length < 6) {
        message.error('新密码至少6位');
        return;
      }
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次密码不一致');
        return;
      }
      if (!isSupabaseConfigured) {
        message.error('Supabase 未配置');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) {
        message.error(error.message);
        return;
      }
      message.success('密码已修改，所有设备下次登录需用新密码');
      setPwdModalOpen(false);
      pwdForm.resetFields();
    } catch { /* ignore */ }
  };

  const allUserColumns = [
    {
      title: '姓名', dataIndex: 'name', key: 'name',
      render: (name: string, record: Partial<Doctor>) => (
        <a onClick={() => handleEditUser(record)} style={{ fontWeight: 700 }}>{name || '未命名'}</a>
      ),
    },
    {
      title: '状态', key: 'status',
      render: (_: unknown, record: Partial<Doctor>) => (
        record.verified ? <Tag color="success">已认证</Tag> : <Tag color="warning">待审核</Tag>
      ),
    },
    {
      title: '分类', dataIndex: 'category', key: 'category',
      render: (cat: string) => cat ? <Tag color="blue">{cat}</Tag> : '-',
    },
    {
      title: '单位', dataIndex: 'hospital', key: 'hospital',
      render: (h: string) => h || '-',
    },
    {
      title: '地区', key: 'location',
      render: (_: unknown, record: Partial<Doctor>) => `${record.province || ''} ${record.city || ''}`.trim() || '-',
    },
    {
      title: '关键词', dataIndex: 'keywords', key: 'keywords',
      render: (keywords: string[]) => (
        <span>{keywords?.slice(0, 3).map((k) => <Tag key={k} style={{ marginBottom: 2 }}>{k}</Tag>) || '-'}</span>
      ),
    },
    {
      title: '注册时间', dataIndex: 'createdAt', key: 'createdAt',
      render: (t: string) => t ? new Date(t).toLocaleString('zh-CN') : '-',
    },
  ];

  const allUsers = useMemo(() => {
    const map = new Map<string, Partial<Doctor>>();
    registeredUsers.forEach((u) => map.set(u.id!, u));
    pendingUsers.forEach((u) => { if (!map.has(u.id!)) map.set(u.id!, u); });
    return Array.from(map.values());
  }, [registeredUsers, pendingUsers]);

  // 关键词收录：从所有用户中提取关键词，按频率排序
  const keywordMap = useMemo(() => {
    const map = new Map<string, { count: number; users: Partial<Doctor>[] }>();
    allUsers.forEach((u) => {
      if (u.keywords) {
        u.keywords.forEach((kw) => {
          const entry = map.get(kw) || { count: 0, users: [] };
          entry.count++;
          if (!entry.users.find((x) => x.id === u.id)) {
            entry.users.push(u);
          }
          map.set(kw, entry);
        });
      }
    });
    return Array.from(map.entries())
      .map(([keyword, data]) => ({ keyword, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [allUsers]);

  // 关键词列表（直接显示全部，无搜索框）
  const filteredKeywords = keywordMap;

  const handleEditUser = (user: Partial<Doctor>) => {
    setEditUser(user);
    editForm.setFieldsValue({
      name: user.name,
      category: user.category,
      hospital: user.hospital,
      title: user.title,
      province: user.province,
      city: user.city,
      contact_phone: user.contact_phone,
      bio: user.bio,
      keywords: user.keywords?.join('、') || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (!editUser?.id) return;
      const updated = {
        ...editUser,
        name: values.name,
        category: values.category,
        hospital: values.hospital,
        title: values.title,
        province: values.province,
        city: values.city,
        contact_phone: values.contact_phone,
        bio: values.bio,
        keywords: values.keywords ? values.keywords.split(/[,，、\s]+/).filter(Boolean) : [],
      };
      // 更新本地存储
      const updateList = (list: Partial<Doctor>[]) =>
        list.map((u) => (u.id === editUser.id ? updated : u));
      // 通过回调通知父组件更新（这里直接操作localStorage）
      const allStored = [
        ...JSON.parse(localStorage.getItem('ssol_registeredUsers') || '[]'),
        ...JSON.parse(localStorage.getItem('ssol_pendingUsers') || '[]'),
      ];
      const idx = allStored.findIndex((u: any) => u.id === editUser.id);
      if (idx >= 0) {
        allStored[idx] = updated;
        localStorage.setItem('ssol_registeredUsers', JSON.stringify(allStored.filter((u: any) => u.verified)));
        localStorage.setItem('ssol_pendingUsers', JSON.stringify(allStored.filter((u: any) => !u.verified)));
      }
      message.success('用户信息已更新');
      setEditUser(null);
      // 强制刷新页面数据
      window.location.reload();
    } catch { /* ignore */ }
  };

  const handleDeleteUser = (user: Partial<Doctor>) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${user.name}」吗？此操作不可恢复。`,
      okText: '确认删除',
      okType: 'danger',
      onOk: () => {
        if (!user.id) return;
        const reg = JSON.parse(localStorage.getItem('ssol_registeredUsers') || '[]').filter((u: any) => u.id !== user.id);
        const pend = JSON.parse(localStorage.getItem('ssol_pendingUsers') || '[]').filter((u: any) => u.id !== user.id);
        localStorage.setItem('ssol_registeredUsers', JSON.stringify(reg));
        localStorage.setItem('ssol_pendingUsers', JSON.stringify(pend));
        message.success('用户已删除');
        window.location.reload();
      },
    });
  };

  // 选中关键词对应的用户
  const keywordUsers = useMemo(() => {
    if (!selectedKeyword) return [];
    const entry = keywordMap.find((k) => k.keyword === selectedKeyword);
    return entry?.users || [];
  }, [selectedKeyword, keywordMap]);

  const pendingColumns = [
    {
      title: '姓名', dataIndex: 'name', key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '分类', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: '单位', dataIndex: 'hospital', key: 'hospital',
    },
    {
      title: '地区', key: 'location',
      render: (_: unknown, record: Partial<Doctor>) => `${record.province} ${record.city}`,
    },
    {
      title: '关键词', dataIndex: 'keywords', key: 'keywords',
      render: (keywords: string[]) => (
        <span>{keywords?.slice(0, 3).map((k) => <Tag key={k} style={{ marginBottom: 2 }}>{k}</Tag>)}</span>
      ),
    },
    {
      title: '操作', key: 'action', width: 220,
      render: (_: unknown, record: Partial<Doctor>) => (
        <Space>
          <Button size="small" icon={<EyeIcon />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => record.id && onApprove(record.id)}>
            通过
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => record.id && onReject(record.id)}>
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <Title level={3} style={{ margin: 0 }}>
            <DashboardOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            管理后台
          </Title>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => setPwdModalOpen(true)}
            style={{ fontSize: 14 }}
          >
            修改密码
          </Button>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="今日访客"
                value={visitorStats.today}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="本周访客"
                value={visitorStats.thisWeek}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待审核申请"
                value={pendingUsers.length}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已认证专家"
                value={16}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 用户管理 Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="small" items={[
          {
            key: 'pending',
            label: `待审核 (${pendingUsers.length})`,
            children: (
              <Table
                columns={pendingColumns}
                dataSource={pendingUsers.map((u, i) => ({ ...u, key: u.id || `pending-${i}` }))}
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
                locale={{ emptyText: '暂无待审核申请' }}
              />
            ),
          },
          {
            key: 'all',
            label: `所有用户 (${allUsers.length})`,
            children: (
              <Table
                columns={allUserColumns}
                dataSource={allUsers.map((u, i) => ({ ...u, key: u.id || `user-${i}` }))}
                pagination={{ pageSize: 10 }}
                size="small"
                scroll={{ x: 800 }}
                locale={{ emptyText: '暂无注册用户' }}
              />
            ),
          },
          {
            key: 'keywords',
            label: `关键词收录 (${keywordMap.length})`,
            children: (
              <div>
                {selectedKeyword ? (
                  <div>
                    <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Button size="small" onClick={() => setSelectedKeyword(null)}>← 返回关键词列表</Button>
                      <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{selectedKeyword}</Tag>
                      <span style={{ color: '#666', fontSize: 13 }}>共 {keywordUsers.length} 位用户使用此关键词</span>
                    </div>
                    <Table
                      columns={allUserColumns}
                      dataSource={keywordUsers.map((u, i) => ({ ...u, key: u.id || `kw-user-${i}` }))}
                      pagination={{ pageSize: 10 }}
                      size="small"
                      scroll={{ x: 800 }}
                      locale={{ emptyText: '暂无用户' }}
                    />
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {filteredKeywords.map((kw) => (
                        <Tag
                          key={kw.keyword}
                          color="blue"
                          style={{ cursor: 'pointer', fontSize: 13, padding: '4px 12px' }}
                          onClick={() => setSelectedKeyword(kw.keyword)}
                        >
                          {kw.keyword} <span style={{ color: '#999', fontSize: 11 }}>({kw.count})</span>
                        </Tag>
                      ))}
                    </div>
                    {filteredKeywords.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>暂无关键词数据</div>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]} style={{ marginBottom: 24 }} />

        {/* 设备分布和访客地区 - 仅在待审核/所有用户页显示 */}
        {(activeTab === 'pending' || activeTab === 'all') && (
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Card title="设备分布" size="small" style={{ marginBottom: 16 }}>
              {deviceStats.map((d) => (
                <div key={d.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Text>{d.name}</Text>
                    <Text type="secondary">{d.count} ({d.percent}%)</Text>
                  </div>
                  <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${d.percent}%`, background: '#1677ff', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="访客地区 TOP" size="small">
              {regionStats.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text>
                    {i < 3 ? <Tag color={i === 0 ? 'gold' : i === 1 ? 'silver' : 'orange'} style={{ marginRight: 6 }}>{i + 1}</Tag> : <span style={{ width: 24, display: 'inline-block', textAlign: 'center', marginRight: 6 }}>{i + 1}</span>}
                    {r.name}
                  </Text>
                  <Text type="secondary">{r.count}人</Text>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
        )}
      </div>

      {/* 修改密码弹窗 */}
      <Modal
        title={<span><LockOutlined style={{ color: '#1677ff', marginRight: 8 }} />修改管理员密码</span>}
        open={pwdModalOpen}
        onCancel={() => { setPwdModalOpen(false); pwdForm.resetFields(); }}
        onOk={handleChangePassword}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={pwdForm} layout="vertical" size="large" style={{ paddingTop: 8 }}>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="至少6位" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请再次输入' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用户详情审核弹窗 */}
      <Modal
        title={<span><EyeIcon style={{ color: '#1677ff', marginRight: 8 }} />注册信息审核</span>}
        open={!!detailUser}
        onCancel={() => setDetailUser(null)}
        width={600}
        footer={[
          <Button key="reject" danger icon={<CloseOutlined />} onClick={() => { if (detailUser?.id) onReject(detailUser.id); setDetailUser(null); }}>
            拒绝
          </Button>,
          <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={() => { if (detailUser?.id) onApprove(detailUser.id); setDetailUser(null); }}>
            通过
          </Button>,
        ]}
      >
        {detailUser && (
          <div>
            {/* 违规警告 */}
            {detailViolations.length > 0 && (
              <Alert
                type="error"
                showIcon
                icon={<WarningOutlined />}
                message="检测到疑似违规内容，请仔细审核！"
                description={
                  <div style={{ marginTop: 8 }}>
                    {detailViolations.map((v, i) => (
                      <div key={i} style={{ marginBottom: 4 }}>
                        <strong>{v.field}：</strong>包含敏感词「{v.words.join('、')}」
                      </div>
                    ))}
                  </div>
                }
                style={{ marginBottom: 16 }}
              />
            )}
            {photoWarning && (
              <Alert
                type="warning"
                showIcon
                message="用户上传了外部链接照片，请人工核实图片内容是否合规"
                style={{ marginBottom: 16 }}
              />
            )}
            {detailViolations.length === 0 && !photoWarning && (
              <Alert type="success" showIcon message="未检测到违规内容" style={{ marginBottom: 16 }} />
            )}

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="昵称">{detailUser.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="真实姓名">{(detailUser as any).realName || '-'}</Descriptions.Item>
              <Descriptions.Item label="分类">{detailUser.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="职称">{detailUser.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="工作单位" span={2}>{detailUser.hospital || '-'}</Descriptions.Item>
              <Descriptions.Item label="地区">{detailUser.province || ''} {detailUser.city || ''}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detailUser.contact_phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="注册时间" span={2}>
                {(detailUser as any).createdAt ? new Date((detailUser as any).createdAt).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="关键词" span={2}>
                {detailUser.keywords?.map((k) => <Tag key={k} color="blue">{k}</Tag>) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="自我介绍" span={2}>
                <div style={{ whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>{detailUser.bio || '-'}</div>
              </Descriptions.Item>
              {((detailUser as any).photo) && (
                <Descriptions.Item label="照片" span={2}>
                  {((detailUser as any).photo as string).startsWith('data:image') ? (
                    <img src={(detailUser as any).photo} alt="用户上传照片" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8 }} />
                  ) : (
                    <a href={(detailUser as any).photo} target="_blank" rel="noopener noreferrer">查看外部照片链接</a>
                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* 编辑用户信息弹窗 */}
      <Modal
        title={<span><EditOutlined style={{ color: '#1677ff', marginRight: 8 }} />编辑用户信息</span>}
        open={!!editUser}
        onCancel={() => { setEditUser(null); editForm.resetFields(); }}
        width={560}
        footer={[
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={() => { if (editUser) handleDeleteUser(editUser); setEditUser(null); }}>
            删除用户
          </Button>,
          <Button key="cancel" onClick={() => { setEditUser(null); editForm.resetFields(); }}>取消</Button>,
          <Button key="save" type="primary" icon={<CheckOutlined />} onClick={handleSaveEdit}>保存</Button>,
        ]}
      >
        {editUser && (
          <Form form={editForm} layout="vertical" size="large" style={{ paddingTop: 8 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="name" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
                  <Input prefix={<UserOutlined />} placeholder="昵称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="category" label="分类">
                  <Input placeholder="如：医生、非遗手艺" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="title" label="职称">
                  <Input placeholder="如：主任医师" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="hospital" label="工作单位">
                  <Input placeholder="工作单位" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="province" label="省">
                  <Input placeholder="省" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="city" label="市">
                  <Input placeholder="市" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="contact_phone" label="联系电话">
                  <Input placeholder="电话" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="keywords" label="关键词">
              <Input placeholder="用空格或顿号分隔" />
            </Form.Item>
            <Form.Item name="bio" label="自我介绍">
              <Input.TextArea rows={3} placeholder="自我介绍" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
