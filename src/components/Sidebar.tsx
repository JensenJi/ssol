import { useState, useEffect } from 'react';
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

  const [batchIndex, setBatchIndex] = useState(0);
  const BATCH_SIZE = 8;

  useEffect(() => {
    const timer = setInterval(() => {
      setBatchIndex((prev) => (prev + 1) % Math.ceil(merged.length / BATCH_SIZE));
    }, 2500);
    return () => clearInterval(timer);
  }, [merged.length]);

  const startIdx = batchIndex * BATCH_SIZE;
  const batchKeywords = merged.slice(startIdx, startIdx + BATCH_SIZE);

  return (
    <div className="sidebar-panel">
      {/* 信息库关键词 - 圆容器纯文字展示 */}
      <div className="panel-section keyword-section">
        <div className="panel-title"><KeyOutlined style={{ color: '#1677ff' }} /> 信息库关键词</div>
        <div className="keyword-circle-container">
          {batchKeywords.map((kw) => (
            <span
              key={kw}
              className="kw-circle-tag"
              onClick={() => onKeywordClick(kw)}
            >
              {kw}
            </span>
          ))}
        </div>
        <div className="rotate-dots">
          {Array.from({ length: Math.ceil(merged.length / BATCH_SIZE) }).map((_, i) => (
            <span key={i} className={`dot ${i === batchIndex ? 'dot-active' : ''}`} />
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
