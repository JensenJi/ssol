import { Tag } from 'antd';
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
  allKeywords, onKeywordClick, onToggleSidebar,
}: SidebarProps) {
  const merged = [...new Set([...allKeywords, ...extraKeywords])];

  return (
    <div className="sidebar-panel">
      <div className="sidebar-close-btn" onClick={onToggleSidebar} title="关闭侧栏">✕</div>
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
    </div>
  );
}
