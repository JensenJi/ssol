import { useState } from 'react';
import {
  Modal, Avatar, Tag, Typography, Divider, Button,
} from 'antd';
import {
  UserOutlined, EnvironmentOutlined, SafetyCertificateOutlined,
  EditOutlined, PhoneOutlined, HeartOutlined, HeartFilled,
  FileTextOutlined, PictureOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';
import { getStarLevel as calcStarLevel } from '../data/mockData';
import ResumeEditor from './ResumeEditor';
import PhotoAlbum from './PhotoAlbum';

const { Title, Text, Paragraph } = Typography;

interface UserProfileProps {
  user: Doctor | null;
  open: boolean;
  onClose: () => void;
  isFavorited: boolean;
  onFavorite: () => void;
  isLoggedIn: boolean;
}

const mockArticles: Record<string, { id: string; title: string; date: string; views: number }[]> = {
  '1': [
    { id: '1', title: '渐冻症最新治疗进展', date: '2026-07-15', views: 328 },
    { id: '2', title: '运动神经元病患者的日常护理', date: '2026-07-10', views: 512 },
  ],
  '2': [
    { id: '3', title: '法洛四联症术后注意事项', date: '2026-06-20', views: 890 },
    { id: '4', title: '先心病家庭护理指南', date: '2026-05-15', views: 445 },
  ],
  '3': [
    { id: '5', title: '古陶瓷修复工艺详解', date: '2026-07-01', views: 1200 },
    { id: '6', title: '锔瓷技艺的传承与创新', date: '2026-06-18', views: 780 },
  ],
};

export default function UserProfile({ user, open, onClose, isFavorited, onFavorite }: UserProfileProps) {
  const [tab, setTab] = useState<'info' | 'articles' | 'resume' | 'photos'>('info');
  if (!user) return null;

  const starInfo = calcStarLevel(user.likes || 0);
  const articles = mockArticles[user.id] || [
    { id: 'default', title: `${user.name}的专业分享`, date: '2026-07-01', views: 100 },
  ];

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={800} title={null} closable>
      <div className="profile-modal">
        <div className="profile-header">
          <Avatar size={72} style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
          <div className="profile-header-info">
            <Title level={4} style={{ margin: 0 }}>
              {user.name}
              {user.verified && (
                <Tag icon={<SafetyCertificateOutlined />} color="success" style={{ marginLeft: 8 }}>已认证</Tag>
              )}
              <Button
                type="link"
                size="small"
                icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={onFavorite}
                style={{ marginLeft: 8 }}
              >
                {isFavorited ? '已收藏' : '收藏'}
              </Button>
            </Title>
            <Text type="secondary">{user.title} | {user.hospital}</Text>
            {/* 获赞和星级 */}
            <div className="profile-stars">
              <span className="star-level" style={{ fontSize: 18 }}>{starInfo.icon}</span>
              <span className="star-title" style={{ color: '#fa8c16', fontWeight: 600, marginLeft: 6 }}>{starInfo.title}</span>
              <span className="star-likes" style={{ marginLeft: 12, color: '#666' }}>
                👍 获赞 <strong style={{ color: '#ff4d4f' }}>{user.likes.toLocaleString()}</strong>
              </span>
            </div>
            <div className="profile-tags">
              {user.keywords.map((kw) => <Tag key={kw} color="blue">{kw}</Tag>)}
            </div>
            <div className="profile-location">
              <EnvironmentOutlined /> {user.province} {user.city}
              <span style={{ marginLeft: 12 }}><PhoneOutlined /> {user.contact_phone}</span>
            </div>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 卖点展示 */}
        <div className="profile-value">
          <div className="value-title">能为你提供什么</div>
          <Paragraph style={{ margin: '8px 0', color: '#333' }}>{user.bio}</Paragraph>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className="profile-tabs">
          <Button type={tab === 'info' ? 'primary' : 'default'} size="small" icon={<UserOutlined />} onClick={() => setTab('info')}>个人信息</Button>
          <Button type={tab === 'articles' ? 'primary' : 'default'} size="small" icon={<EditOutlined />} onClick={() => setTab('articles')}>发布的文章</Button>
          <Button type={tab === 'resume' ? 'primary' : 'default'} size="small" icon={<FileTextOutlined />} onClick={() => setTab('resume')}>我的简历</Button>
          <Button type={tab === 'photos' ? 'primary' : 'default'} size="small" icon={<PictureOutlined />} onClick={() => setTab('photos')}>我的照片</Button>
        </div>

        <div className="profile-content">
          {tab === 'info' && (
            <div className="profile-info">
              <div className="profile-detail-row"><span className="label">工作单位：</span><span>{user.hospital}</span></div>
              <div className="profile-detail-row"><span className="label">职称：</span><span>{user.title}</span></div>
              <div className="profile-detail-row"><span className="label">所在地区：</span><span>{user.province} {user.city}</span></div>
              <div className="profile-detail-row"><span className="label">服务范围：</span><span>方圆 {user.visible_range} 公里</span></div>
              <div className="profile-detail-row"><span className="label">联系方式：</span><span>{user.contact_phone}</span></div>
            </div>
          )}
          {tab === 'articles' && (
            <div className="profile-articles">
              {articles.map((article) => (
                <div key={article.id} className="article-item">
                  <div className="article-title">
                    <EditOutlined style={{ marginRight: 6, color: '#1677ff' }} />{article.title}
                  </div>
                  <div className="article-meta">
                    <span>{article.date}</span><span>阅读 {article.views}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'resume' && <ResumeEditor />}
          {tab === 'photos' && <PhotoAlbum />}
        </div>
      </div>
    </Modal>
  );
}
