import { useState } from 'react';
import { Tag } from 'antd';
import {
  KeyOutlined, RightOutlined, DownOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

interface SidebarProps {
  doctors: Doctor[];
  allKeywords: string[];
  onKeywordClick: (keyword: string) => void;
  onDoctorClick: (doctor: Doctor) => void;
  onToggleSidebar?: () => void;
}

const extraKeywords = [
  '皮影戏', '景泰蓝', '苏绣', '漆器', '剪纸', '泥塑', '木雕',
  '银饰锻造', '扎染', '蜡染', '油纸伞', '竹编', '土陶',
];

export default function Sidebar({
  doctors, allKeywords, onKeywordClick, onDoctorClick, onToggleSidebar,
}: SidebarProps) {
  const [keywordOpen, setKeywordOpen] = useState(false);
  const merged = [...new Set([...allKeywords, ...extraKeywords])];

  return (
    <div className="sidebar-panel">
      {/* 信息库关键词 - 默认隐藏，开关控制 */}
      <div className="panel-section keyword-section">
        <div className="panel-title keyword-toggle" onClick={() => setKeywordOpen(!keywordOpen)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {keywordOpen ? <DownOutlined /> : <RightOutlined />}
            <KeyOutlined style={{ color: '#1677ff' }} />
            信息库关键词
          </span>
        </div>
        {keywordOpen && (
          <div className="keyword-tags-container">
            {merged.map((kw) => (
              <span
                key={kw}
                className="kw-tag"
                onClick={() => onKeywordClick(kw)}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
