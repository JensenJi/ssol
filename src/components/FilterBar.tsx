import { Select, Space, Tag } from 'antd';
import { departments, distanceOptions } from '../data/mockData';
import { FilterOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

interface FilterBarProps {
  selectedDepartment: string;
  selectedDistance: number;
  verifiedOnly: boolean;
  onDepartmentChange: (dept: string) => void;
  onDistanceChange: (dist: number) => void;
  onVerifiedChange: (verified: boolean) => void;
  resultCount: number;
}

export default function FilterBar({
  selectedDepartment,
  selectedDistance,
  verifiedOnly,
  onDepartmentChange,
  onDistanceChange,
  onVerifiedChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-left">
        <FilterOutlined style={{ color: '#666', marginRight: 8 }} />
        <Space wrap>
          <Select
            value={selectedDepartment}
            onChange={onDepartmentChange}
            style={{ width: 140 }}
            options={departments.map((d) => ({ label: d, value: d }))}
          />
          <Select
            value={selectedDistance}
            onChange={onDistanceChange}
            style={{ width: 140 }}
            options={distanceOptions}
          />
          <Tag.CheckableTag
            checked={verifiedOnly}
            onChange={onVerifiedChange}
            icon={<SafetyCertificateOutlined />}
          >
            <SafetyCertificateOutlined /> 仅看已认证
          </Tag.CheckableTag>
        </Space>
      </div>
      <div className="filter-right">
        <span style={{ color: '#999', fontSize: 13 }}>
          共找到 <strong style={{ color: '#1677ff' }}>{resultCount}</strong> 位专业人士
        </span>
      </div>
    </div>
  );
}
