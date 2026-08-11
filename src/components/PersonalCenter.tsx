import { useState } from 'react';
import { Card, Avatar, Tag, Button, Input, Form, Select, message, Divider, List, Empty } from 'antd';
import {
  UserOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined,
  EditOutlined, HeartOutlined, StarOutlined, TagsOutlined,
  ArrowLeftOutlined, SaveOutlined, LockOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';
import ResumeEditor from './ResumeEditor';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const { Option } = Select;
const categories = ['疑难杂症', '稀有工种', '非遗手艺', '农业专家', '特殊技能', '翻译语言', '医生', '其它'];

interface PersonalCenterProps {
  onBack: () => void;
  user: Partial<Doctor>;
  favorites: string[];
  allDoctors: Doctor[];
  onUpdateUser: (user: Partial<Doctor>) => void;
}

export default function PersonalCenter({ onBack, user, favorites, allDoctors, onUpdateUser }: PersonalCenterProps) {
  const [tab, setTab] = useState<'card' | 'edit' | 'resume' | 'favorites' | 'keywords' | 'interactions' | 'security'>('card');
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // 收藏的医生列表
  const favoritedDoctors = allDoctors.filter((d) => favorites.includes(d.id));

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onUpdateUser({
        ...user,
        name: values.nickname || user.name,
        keywords: values.keywords?.split(/[,，、\s]+/).filter(Boolean) || user.keywords,
        hospital: values.workplace || user.hospital,
        title: values.title || user.title,
        bio: values.bio || user.bio,
        contact_phone: values.phone || user.contact_phone,
      });
      message.success('信息已更新');
      setEditing(false);
    } catch {
      message.warning('请填写必填项');
    }
  };

  const tabs = [
    { key: 'card', label: '我的卡片', icon: <UserOutlined /> },
    { key: 'edit', label: '信息修改', icon: <EditOutlined /> },
    { key: 'resume', label: '简历', icon: <EditOutlined /> },
    { key: 'favorites', label: `收藏的好友 (${favoritedDoctors.length})`, icon: <HeartOutlined /> },
    { key: 'keywords', label: '我的关键词', icon: <TagsOutlined /> },
    { key: 'interactions', label: '互动记录', icon: <StarOutlined /> },
    { key: 'security', label: '账号安全', icon: <LockOutlined /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* 顶部导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack} style={{ fontSize: 16 }}>
            返回首页
          </Button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>个人中心</h2>
        </div>

        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <Button
              key={t.key}
              type={tab === t.key ? 'primary' : 'default'}
              icon={t.icon}
              onClick={() => setTab(t.key as any)}
              style={{ borderRadius: 20 }}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* 我的卡片 */}
        {tab === 'card' && (
          <Card>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <Avatar size={100} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: 24 }}>{user.name || '未设置昵称'}</h2>
                <div style={{ color: '#666', marginBottom: 8 }}>
                  {user.title && <Tag color="blue">{user.title}</Tag>}
                  {user.category && <Tag>{user.category}</Tag>}
                  {user.verified && <Tag color="success">已认证</Tag>}
                </div>
                <div style={{ color: '#999', fontSize: 13, lineHeight: 1.8 }}>
                  {user.hospital && <div><EnvironmentOutlined style={{ marginRight: 6 }} />{user.hospital}</div>}
                  {user.province && user.city && <div><EnvironmentOutlined style={{ marginRight: 6 }} />{user.province} {user.city}</div>}
                  {user.contact_phone && <div><PhoneOutlined style={{ marginRight: 6 }} />{user.contact_phone}</div>}
                </div>
                {user.keywords && user.keywords.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>关键词：</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {user.keywords.map((kw) => <Tag key={kw} color="blue">{kw}</Tag>)}
                    </div>
                  </div>
                )}
                {user.bio && (
                  <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1677ff', marginBottom: 6 }}>能为你提供什么</div>
                    <div style={{ fontSize: 14, color: '#333' }}>{user.bio}</div>
                  </div>
                )}
              </div>
            </div>
            <Divider />
            <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{user.likes || 0}</div>
                <div style={{ fontSize: 12, color: '#999' }}>获赞</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16' }}>{favorites.length}</div>
                <div style={{ fontSize: 12, color: '#999' }}>收藏</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{user.keywords?.length || 0}</div>
                <div style={{ fontSize: 12, color: '#999' }}>关键词</div>
              </div>
            </div>
          </Card>
        )}

        {/* 信息修改 */}
        {tab === 'edit' && (
          <Card title="修改个人信息">
            <Form form={form} layout="vertical" size="large" initialValues={{
              nickname: user.name,
              workplace: user.hospital,
              title: user.title,
              phone: user.contact_phone,
              bio: user.bio,
              keywords: user.keywords?.join('、') || '',
            }}>
              <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
                <Input prefix={<UserOutlined />} placeholder="你的展示名称" />
              </Form.Item>
              <Form.Item name="workplace" label="工作单位">
                <Input placeholder="工作单位" />
              </Form.Item>
              <Form.Item name="title" label="职称/头衔">
                <Input placeholder="如：主任医师、高级技师" />
              </Form.Item>
              <Form.Item name="phone" label="联系电话">
                <Input prefix={<PhoneOutlined />} placeholder="联系电话" />
              </Form.Item>
              <Form.Item name="keywords" label="关键词">
                <Input placeholder="用空格或顿号分隔" />
              </Form.Item>
              <Form.Item name="bio" label="自我介绍">
                <Input.TextArea rows={4} placeholder="描述你能提供的专业服务..." />
              </Form.Item>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="large">
                保存修改
              </Button>
            </Form>
          </Card>
        )}

        {/* 简历 */}
        {tab === 'resume' && (
          <Card>
            <ResumeEditor />
          </Card>
        )}

        {/* 收藏的好友 */}
        {tab === 'favorites' && (
          <Card title={`收藏的好友 (${favoritedDoctors.length})`}>
            {favoritedDoctors.length > 0 ? (
              <List
                dataSource={favoritedDoctors}
                renderItem={(doc) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />}
                      title={<strong>{doc.name}</strong>}
                      description={
                        <div>
                          <Tag color="blue">{doc.title}</Tag>
                          <span style={{ color: '#666', marginRight: 12 }}>{doc.hospital}</span>
                          <span style={{ color: '#999' }}>{doc.province} {doc.city}</span>
                        </div>
                      }
                    />
                    <div>
                      {doc.keywords?.slice(0, 3).map((kw) => <Tag key={kw}>{kw}</Tag>)}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="还没有收藏的好友，去首页搜索看看吧" />
            )}
          </Card>
        )}

        {/* 我的关键词 */}
        {tab === 'keywords' && (
          <Card title="我的关键词">
            {user.keywords && user.keywords.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.keywords.map((kw) => (
                  <Tag key={kw} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{kw}</Tag>
                ))}
              </div>
            ) : (
              <Empty description="还没有设置关键词" />
            )}
            <Divider />
            <div style={{ color: '#999', fontSize: 13 }}>
              关键词是别人找到你的核心标签。在「信息修改」中可以更新你的关键词。
            </div>
          </Card>
        )}

        {/* 互动记录 */}
        {tab === 'interactions' && (
          <Card title="互动记录">
            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ff4d4f' }}>{user.likes || 0}</div>
                <div style={{ color: '#999', fontSize: 13 }}>收到的赞</div>
              </Card>
              <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fa8c16' }}>{favorites.length}</div>
                <div style={{ color: '#999', fontSize: 13 }}>我收藏的</div>
              </Card>
              <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>0</div>
                <div style={{ color: '#999', fontSize: 13 }}>收藏我的</div>
              </Card>
            </div>
            <Empty description="互动记录功能开发中..." />
          </Card>
        )}

        {/* 账号安全 */}
        {tab === 'security' && (
          <Card title="修改密码">
            {!isSupabaseConfigured() ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                <LockOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <p>认证服务未配置，无法修改密码</p>
                <p style={{ fontSize: 12 }}>请联系管理员配置 Supabase</p>
              </div>
            ) : (
              <div style={{ maxWidth: 480 }}>
                <p style={{ color: '#666', fontSize: 13, marginBottom: 24 }}>
                  修改密码后，所有设备下次登录都需要使用新密码。
                </p>
                <Form form={pwdForm} layout="vertical" size="large">
                  <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少6位）" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请再次输入新密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={pwdLoading}
                    onClick={async () => {
                      try {
                        const values = await pwdForm.validateFields();
                        if (values.newPassword !== values.confirmPassword) {
                          message.error('两次密码不一致');
                          return;
                        }
                        setPwdLoading(true);
                        const { data } = await supabase.auth.getSession();
                        if (!data.session) {
                          setPwdLoading(false);
                          message.error('请先登录后再修改密码');
                          return;
                        }
                        const { error } = await supabase.auth.updateUser({ password: values.newPassword });
                        setPwdLoading(false);
                        if (error) {
                          message.error(error.message);
                          return;
                        }
                        message.success('密码修改成功，下次登录请使用新密码');
                        pwdForm.resetFields();
                      } catch {
                        setPwdLoading(false);
                      }
                    }}
                    size="large"
                  >
                    确认修改
                  </Button>
                </Form>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
