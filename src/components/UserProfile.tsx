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
import ArticleView from './ArticleView';

const { Title, Text, Paragraph } = Typography;

interface UserProfileProps {
  user: Doctor | null;
  open: boolean;
  onClose: () => void;
  isFavorited: boolean;
  onFavorite: () => void;
  isLoggedIn: boolean;
}

interface ArticleItem {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
  images?: string[];
}

const mockArticles: Record<string, ArticleItem[]> = {
  '1': [
    {
      id: '1', title: '渐冻症最新治疗进展', date: '2026-07-15',
      author: '张医生', category: '医学',
      content: '渐冻症（ALS）是一种进行性神经退行性疾病，近年来在治疗方面取得了重要进展。\n\n基因治疗是当前的研究热点之一。通过靶向SOD1、C9orf72等致病基因，研究人员正在开发反义寡核苷酸（ASO）和RNA干扰疗法，以减缓疾病进展。\n\n[img:https://picsum.photos/seed/als1/600/300]\n\n此外，干细胞移植技术也在临床试验中显示出一定潜力。间充质干细胞（MSC）的移植可能有助于保护运动神经元，延缓肌肉萎缩。\n\n药物治疗方面，利鲁唑和依达拉奉仍是目前获批的主要药物，新的联合用药方案正在探索中。',
    },
    {
      id: '2', title: '运动神经元病患者的日常护理', date: '2026-07-10',
      author: '张医生', category: '护理',
      content: '运动神经元病（MND）患者的日常护理对延缓病情、提高生活质量至关重要。\n\n首先是呼吸管理。随着病情进展，患者可能出现呼吸肌无力，需要使用无创呼吸机辅助通气。定期监测肺功能是必要的。\n\n其次是营养支持。吞咽困难是常见问题，建议早期进行吞咽功能评估，必要时采用鼻饲或胃造瘘保证营养摄入。\n\n康复训练也不容忽视。适度的被动运动和物理治疗可以延缓关节挛缩，保持肌肉功能。',
    },
  ],
  '2': [
    {
      id: '3', title: '法洛四联症术后注意事项', date: '2026-06-20',
      author: '李医生', category: '心脏外科',
      content: '法洛四联症（TOF）是最常见的紫绀型先天性心脏病，手术矫治后需要注意以下事项。\n\n术后定期随访非常重要，建议每半年至一年进行一次心脏超声检查，评估右心室功能和肺动脉瓣情况。\n\n[img:https://picsum.photos/seed/tof1/600/300]\n\n运动方面，术后恢复良好的患者可以进行适度运动，但应避免剧烈竞技性运动。具体运动方案需根据心功能评估结果制定。\n\n抗凝治疗：部分患者术后需要长期抗凝，需定期监测凝血功能。',
    },
    {
      id: '4', title: '先心病家庭护理指南', date: '2026-05-15',
      author: '李医生', category: '护理',
      content: '先天性心脏病患儿的家庭护理需要家长掌握以下要点。\n\n饮食管理：保证充足营养，少量多餐，避免过饱增加心脏负担。对于心功能较差的患儿，可能需要限制液体摄入。\n\n预防感染：先心病患儿免疫力相对较弱，应注意保暖，避免去人群密集场所，按时接种疫苗。\n\n观察症状：家长需学会观察患儿的呼吸频率、口唇颜色、活动耐力等，发现异常及时就医。',
    },
  ],
  '3': [
    {
      id: '5', title: '古陶瓷修复工艺详解', date: '2026-07-01',
      author: '王师傅', category: '非遗手艺',
      content: '古陶瓷修复是一门精细的传统工艺，需要修复师具备丰富的经验和耐心。\n\n修复流程通常包括：清洗、拼对、粘接、补配、打磨、作色、做旧等步骤。每一步都需要极高的技艺。\n\n[img:https://picsum.photos/seed/ceramic1/600/300]\n\n清洗环节要特别注意，不能使用强酸强碱，通常采用温和的中性清洗剂和软毛刷。对于有彩绘的器物，更要小心处理。\n\n粘接使用的胶粘剂也有讲究，传统使用鱼鳔胶，现代多采用环氧树脂，但可逆性是关键考量。',
    },
    {
      id: '6', title: '锔瓷技艺的传承与创新', date: '2026-06-18',
      author: '王师傅', category: '非遗手艺',
      content: '瓷是中国传统陶瓷修复技艺，被誉为"没有金刚钻，别揽瓷器活"的由来。\n\n锔瓷的基本原理是在破裂的陶瓷两侧钻孔，然后用金属锔钉将碎片连接固定。锔钉的制作和安装需要极高的精度。\n\n[img:https://picsum.photos/seed/juci1/600/300]\n\n现代锔瓷在传承传统技艺的基础上，也融入了新的设计理念。一些修复师将锔钉作为装饰元素，使修复后的器物呈现出独特的美感。\n\n这项技艺已被列入国家级非物质文化遗产名录，传承工作正在积极推进中。',
    },
  ],
};

export default function UserProfile({ user, open, onClose, isFavorited, onFavorite }: UserProfileProps) {
  const [tab, setTab] = useState<'info' | 'articles' | 'resume' | 'photos'>('info');
  if (!user) return null;

  const starInfo = calcStarLevel(user.likes || 0);
  const articles = mockArticles[user.id] || [
    { id: 'default', title: `${user.name}的专业分享`, date: '2026-07-01', author: user.name || '', category: '专业', content: '暂无文章内容。' },
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
          <Button type={tab === 'articles' ? 'primary' : 'default'} size="small" icon={<EditOutlined />} onClick={() => setTab('articles')}>我的文章</Button>
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
          {tab === 'articles' && <ArticleView articles={articles} />}
          {tab === 'resume' && <ResumeEditor />}
          {tab === 'photos' && <PhotoAlbum />}
        </div>
      </div>
    </Modal>
  );
}
