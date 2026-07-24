import { useState } from 'react';
import { Card, Avatar, Tag, Button, Input, List, Empty, Tabs, Statistic, Row, Col } from 'antd';
import {
  UserOutlined, ArrowLeftOutlined, SearchOutlined,
  HeartOutlined, StarOutlined, EyeOutlined,
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
}

export default function UserManagement({ onBack, allUsers, experts, favorites, onFavorite, currentUser }: UserManagementProps) {
  const [tab, setTab] = useState<'all' | 'experts' | 'favorites'>('all');
  const [searchText, setSearchText] = useState('');

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

  const renderUserCard = (user: Partial<Doctor>) => (
    <List.Item style={{ padding: '16px 0' }}>
      <List.Item.Meta
        avatar={<Avatar size={48} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ fontSize: 15 }}>{user.name || '未命名'}</strong>
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
    </div>
  );
}
