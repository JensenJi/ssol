import { Table, Tag, Button } from 'antd';
import { EyeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Doctor } from '../data/mockData';
import { getStarLevel } from '../data/mockData';

interface ResultTableProps {
  doctors: Doctor[];
  onRowClick: (doctor: Doctor) => void;
  favorites: string[];
  onFavorite: (doctor: Doctor) => void;
}

export default function ResultTable({ doctors, onRowClick, favorites, onFavorite }: ResultTableProps) {
  const columns: ColumnsType<Doctor> = [
    {
      title: '序号', key: 'index', width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ fontWeight: 'bold', color: index < 3 ? '#ff4d4f' : '#333' }}>{index + 1}</span>
      ),
    },
    {
      title: '姓名', dataIndex: 'name', key: 'name', width: 90,
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '关键词/专长', dataIndex: 'keywords', key: 'keywords', width: 200,
      render: (keywords: string[]) => (
        <span>{keywords.map((kw) => <Tag key={kw} color="blue" style={{ marginBottom: 2 }}>{kw}</Tag>)}</span>
      ),
    },
    {
      title: '单位', dataIndex: 'hospital', key: 'hospital', width: 180, ellipsis: true,
    },
    {
      title: '地区', key: 'location', width: 100,
      render: (_: unknown, record: Doctor) => `${record.province} ${record.city}`,
    },
    {
      title: '星级', key: 'star', width: 120,
      render: (_: unknown, record: Doctor) => {
        const star = getStarLevel(record.likes || 0);
        return (
          <span>
            <span style={{ fontSize: 14 }}>{star.icon}</span>
            <span style={{ fontSize: 11, color: '#fa8c16', marginLeft: 4 }}>{star.title}</span>
          </span>
        );
      },
    },
    {
      title: '获赞', key: 'likes', width: 70,
      render: (_: unknown, record: Doctor) => (
        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{(record.likes || 0).toLocaleString()}</span>
      ),
    },
    {
      title: '收藏', key: 'fav', width: 60,
      render: (_: unknown, record: Doctor) => (
        <Button
          type="text" size="small"
          icon={favorites.includes(record.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={(e) => { e.stopPropagation(); onFavorite(record); }}
        />
      ),
    },
    {
      title: '操作', key: 'action', width: 60,
      render: (_: unknown, record: Doctor) => (
        <Button type="link" size="small" icon={<EyeOutlined />}
          onClick={(e) => { e.stopPropagation(); onRowClick(record); }}>详情</Button>
      ),
    },
  ];

  return (
    <Table<Doctor>
      columns={columns} dataSource={doctors} rowKey="id"
      pagination={false} size="small"
      onRow={(record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } })}
    />
  );
}
