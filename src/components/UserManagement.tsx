import { useState } from 'react';
import { Card, Avatar, Tag, Button, Input, List, Empty, Tabs, Statistic, Row, Col, Modal, Form, message, Popconfirm } from 'antd';
import {
  UserOutlined, ArrowLeftOutlined, SearchOutlined,
  HeartOutlined, StarOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, CheckOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

const { Search } = Input;

interface UserManagementProps {
  onBack: () => void;
  allUsers: Partial<Doctor>[];
  experts: Doctor[];
  favorites: string[];
  onFavorite: (doctor: Doctor) => void;
  currentUser: Partial<Doctor> | null;
  onUpdateUser?: (user: Partial<Doctor>) => void;
  onDeleteUser?: (id: string) => void;
}

export default function UserManagement({ onBack, allUsers, experts, favorites, onFavorite, currentUser, onUpdateUser, onDeleteUser }: UserManagementProps) {
  const [tab, setTab] = useState<'all' | 'experts' | 'favorites'>('all');
  const [searchText, setSearchText] = useState('');
  const [editUser, setEditUser] = useState<Partial<Doctor> | null>(null);
  const [editForm] = Form.useForm();

  // 过滤用户
  const filterUsers = (users: Partial<Doctor>[]) => {
    if (!searchText) return users;
    const kw = searchText.toLowerCase();
    return users.filter((u) =>
      u.name?.toLowerCase().includes(kw) ||
      u.keywords?.some((k) => k.toLowerCase().includes(kw)) ||
      u.category?.toLowerCase().includes(kw) ||
      u.hospital?.toLowerCase().includes(kw)
    );
  };

  const pendingUsers = allUsers.filter((u) => !u.verified);
  const verifiedUsers = allUsers.filter((u) => u.verified);
  const favoritedExperts = experts.filter((e) => favorites.includes(e.id));

  const handleEditClick = (user: Partial<Doctor>) => {
    setEditUser(user);
    editForm.setFieldsValue({
      name: user.name || '',
      category: user.category || '',
      hospital: user.hospital || '',
      title: user.title || '',
      province: user.province || '',
      city: user.city || '',
      keywords: user.keywords?.join(', ') || '',
      bio: user.bio || '',
    });
  };

  const handleSaveEdit = async () => {
    try {
      const values = await editForm.validateFields();
      if (editUser && onUpdateUser) {
        onUpdateUser({
          ...editUser,
          name: values.name,
          category: values.category,
          hospital: values.hospital,
          title: values.title,
          province: values.province,
          city: values.city,
          keywords: values.keywords ? values.keywords.split(/[,，、\s]+/).filter(Boolean) : [],
          bio: values.bio,
        });
        message.success('用户信息已更新');
        setEditUser(null);
        editForm.resetFields();
      }
    } catch {
      message.warning('请填写必填项');
    }
  };

  const handleDeleteUser = (user: Partial<Doctor>) => {
    if (onDeleteUser && user.id) {
      onDeleteUser(user.id);
      message.success(`已删除用户：${user.name || '未命名'}`);
    }
  };

  const renderUserCard = (user: Partial<Doctor>) => (
    <List.Item style={{ padding: '16px 0' }}>
      <List.Item.Meta
        avatar={<Avatar size={48} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a onClick={() => handleEditClick(user)} style={{ fontWeight: 700, fontSize: 15 }}>{user.name || '未命名'}</a>
            {user.verified ? <Tag color="success" style={{ fontSize: 11 }}>已认证</Tag> : <Tag color="warning" style={{ fontSize: 11 }}>待审核</Tag>}
            {user.category && <Tag style={{ fontSize: 11 }}>{user.category}</Tag>}
          </div>
        }
        description={
          <div style={{ marginTop: 4 }}>
            {user.title && <span style={{ color: '#1677ff', marginRight: 12 }}>{user.title}</span>}
            {user.hospital && <span style={{ color: '#666', marginRight: 12 }}>{user.hospital}</span>}
            {user.province && <span style={{ color: '#999' }}>{user.province} {user.city}</span>}
          </div>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 200 }}>
          {user.keywords?.slice(0, 3).map((kw) => <Tag key={kw} style={{ fontSize: 11 }}>{kw}</Tag>)}
        </div>
        {user.bio && <div style={{ fontSize: 12, color: '#999', maxWidth: 200, textAlign: 'right' }}>{user.bio.slice(0, 30)}...</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditClick(user)}>编辑</Button>
          <Popconfirm title="确定删除此用户？" onConfirm={() => handleDeleteUser(user)} okText="确定" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      </div>
    </List.Item>
  );

  const renderExpertCard = (doc: Doctor) => (
    <List.Item style={{ padding: '16px 0' }}>
      <List.Item.Meta
        avatar={<Avatar size={48} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 15 }}>{doc.name}</strong>
            <Tag color="success" style={{ fontSize: 11 }}>已认证</Tag>
            {doc.category && <Tag style={{ fontSize: 11 }}>{doc.category}</Tag>}
          </div>
        }
        description={
          <div style={{ marginTop: 4 }}>
            {doc.title && <span style={{ color: '#1677ff', marginRight: 12 }}>{doc.title}</span>}
            {doc.hospital && <span style={{ color: '#666', marginRight: 12 }}>{doc.hospital}</span>}
            <span style={{ color: '#999' }}>{doc.province} {doc.city}</span>
          </div>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end', maxWidth: 200 }}>
          {doc.keywords?.slice(0, 3).map((kw) => <Tag key={kw} style={{ fontSize: 11 }}>{kw}</Tag>)}
        </div>
        <Button
          type={favorites.includes(doc.id) ? 'primary' : 'default'}
          size="small"
          icon={<HeartOutlined />}
          onClick={() => onFavorite(doc)}
        >
          {favorites.includes(doc.id) ? '已收藏' : '收藏'}
        </Button>
      </div>
    </List.Item>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 顶部导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ fontSize: 16 }}>
            返回首页
          </Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>用户管理</h2>
        </div>

        {/* 统计 */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col xs={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic title="注册用户" value={allUsers.length} prefix={<UserOutlined />} valueStyle={{ color: '#1677ff', fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic title="已认证" value={verifiedUsers.length} prefix={<StarOutlined />} valueStyle={{ color: '#52c41a', fontSize: 24 }} />
            </Card>
          </Col>
          <Col xs={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic title="待审核" value={pendingUsers.length} prefix={<EyeOutlined />} valueStyle={{ color: '#fa8c16', fontSize: 24 }} />
            </Card>
          </Col>
        </Row>

        {/* 搜索 */}
        <Search
          placeholder="搜索用户名称、关键词、分类..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />

        {/* Tab 切换 */}
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as any)}
          items={[
            {
              key: 'all',
              label: `全部用户 (${allUsers.length})`,
              children: (
                <Card size="small">
                  {filterUsers(allUsers).length > 0 ? (
                    <List dataSource={filterUsers(allUsers)} renderItem={renderUserCard} />
                  ) : (
                    <Empty description="暂无用户" />
                  )}
                </Card>
              ),
            },
            {
              key: 'experts',
              label: `认证专家 (${experts.length})`,
              children: (
                <Card size="small">
                  {filterUsers(experts as Partial<Doctor>[]).length > 0 ? (
                    <List dataSource={filterUsers(experts as Partial<Doctor>[])} renderItem={renderExpertCard} />
                  ) : (
                    <Empty description="暂无认证专家" />
                  )}
                </Card>
              ),
            },
            {
              key: 'favorites',
              label: `我收藏的 (${favoritedExperts.length})`,
              children: (
                <Card size="small">
                  {favoritedExperts.length > 0 ? (
                    <List dataSource={favoritedExperts} renderItem={renderExpertCard} />
                  ) : (
                    <Empty description="还没有收藏的好友" />
                  )}
                </Card>
              ),
            },
          ]}
        />
      </div>

      {/* 编辑用户弹窗 */}
      <Modal
        title={<span><EditOutlined style={{ color: '#1677ff', marginRight: 8 }} />编辑用户信息</span>}
        open={!!editUser}
        onCancel={() => { setEditUser(null); editForm.resetFields(); }}
        width={560}
        footer={[
          <Button key="cancel" onClick={() => { setEditUser(null); editForm.resetFields(); }}>取消</Button>,
          <Button key="save" type="primary" icon={<CheckOutlined />} onClick={handleSaveEdit}>保存</Button>,
        ]}
      >
        {editUser && (
          <Form form={editForm} layout="vertical" size="middle">
            <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="分类">
                  <Input placeholder="如：翻译语言、非遗手艺" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="title" label="职称">
                  <Input placeholder="如：高级翻译" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="hospital" label="单位">
              <Input placeholder="工作单位" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="province" label="省份">
                  <Input placeholder="如：山东" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="city" label="城市">
                  <Input placeholder="如：济宁" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="keywords" label="关键词">
              <Input placeholder="多个关键词用逗号分隔" />
            </Form.Item>
            <Form.Item name="bio" label="简介">
              <Input.TextArea rows={3} placeholder="个人简介" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
