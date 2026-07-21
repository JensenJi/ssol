import { Tag, Avatar, List, Typography } from 'antd';
import {
  UserOutlined, ClockCircleOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

const { Text } = Typography;

interface SidebarProps {
  doctors: Doctor[];
  allKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  onDoctorClick: (doctor: Doctor) => void;
}

const extraKeywords = [
  '皮影戏', '景泰蓝', '苏绣', '漆器', '剪纸', '泥塑', '木雕',
  '银饰锻造', '扎染', '蜡染', '油纸伞', '竹编', '土陶',
];

export default function Sidebar({
  doctors, allKeywords, onKeywordClick, onDoctorClick,
}: SidebarProps) {
  const newUsers = [...doctors].reverse().slice(0, 8);
  const merged = [...new Set([...allKeywords, ...extraKeywords])];

  // 随机生成每个关键词的位置
  const keywordPositions = merged.map((_kw, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    return {
      left: `${10 + col * 22 + Math.random() * 5}%`,
      top: `${10 + row * 30 + Math.random() * 10}%`,
      animationDelay: `${Math.random() * 8}s`,
    };
  });

  return (
    <div className="sidebar-panel">
      {/* 信息库关键词 - 浮动效果 */}
      <div className="panel-section keyword-section">
        <div className="panel-title"><KeyOutlined style={{ color: '#1677ff' }} /> 信息库关键词</div>
        <div className="keyword-float-container">
          {merged.map((kw, i) => (
            <span
              key={kw}
              className="kw-float-tag"
              style={{
                left: keywordPositions[i].left,
                top: keywordPositions[i].top,
                animationDelay: keywordPositions[i].animationDelay,
              }}
              onClick={() => onKeywordClick(kw)}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* 新增数据 - 独立容器 */}
      <div className="panel-section new-users-section">
        <div className="panel-title"><ClockCircleOutlined style={{ color: '#52c41a' }} /> 新增数据</div>
        <List
          size="small" dataSource={newUsers}
          renderItem={(user, index) => (
            <List.Item className="expert-item" onClick={() => onDoctorClick(user)}>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} size={32} />}
                title={
                  <div className="expert-info">
                    <Text strong style={{ fontSize: 12 }}>#{doctors.length - index}</Text>{' '}
                    <span style={{ fontSize: 12 }}>{user.name}</span>
                  </div>
                }
                description={
                  <div className="expert-desc">
                    <span>{user.province} {user.city}</span>
                    <span className="expert-keywords">
                      {user.keywords.slice(0, 2).map((k) => <Tag key={k} style={{ fontSize: 10, margin: '0 2px' }}>{k}</Tag>)}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}
