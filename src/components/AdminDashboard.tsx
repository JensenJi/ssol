import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space } from 'antd';
import {
  DashboardOutlined, UserAddOutlined, EyeOutlined,
  SafetyCertificateOutlined,
  CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

const { Title, Text } = Typography;

interface AdminDashboardProps {
  onBack: () => void;
  pendingUsers: Partial<Doctor>[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

// 模拟访客统计数据
const visitorStats = {
  today: 1286,
  yesterday: 1152,
  thisWeek: 8934,
  thisMonth: 35672,
};

// 模拟设备统计
const deviceStats = [
  { name: 'Windows', count: 680, percent: 52.9 },
  { name: 'macOS', count: 245, percent: 19.0 },
  { name: 'Android', count: 198, percent: 15.4 },
  { name: 'iOS', count: 132, percent: 10.3 },
  { name: 'Linux', count: 31, percent: 2.4 },
];

// 模拟地区统计
const regionStats = [
  { name: '北京', count: 186 },
  { name: '上海', count: 152 },
  { name: '广东', count: 134 },
  { name: '浙江', count: 98 },
  { name: '江苏', count: 87 },
  { name: '山东', count: 76 },
  { name: '四川', count: 65 },
  { name: '湖北', count: 54 },
  { name: '其他', count: 434 },
];

export default function AdminDashboard({ onBack, pendingUsers, onApprove, onReject }: AdminDashboardProps) {
  const pendingColumns = [
    {
      title: '姓名', dataIndex: 'name', key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '分类', dataIndex: 'category', key: 'category',
      render: (cat: string) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: '单位', dataIndex: 'hospital', key: 'hospital',
    },
    {
      title: '地区', key: 'location',
      render: (_: unknown, record: Partial<Doctor>) => `${record.province} ${record.city}`,
    },
    {
      title: '关键词', dataIndex: 'keywords', key: 'keywords',
      render: (keywords: string[]) => (
        <span>{keywords?.slice(0, 3).map((k) => <Tag key={k} style={{ marginBottom: 2 }}>{k}</Tag>)}</span>
      ),
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: unknown, record: Partial<Doctor>) => (
        <Space>
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => record.id && onApprove(record.id)}>
            通过
          </Button>
          <Button danger size="small" icon={<CloseOutlined />} onClick={() => record.id && onReject(record.id)}>
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <Title level={3} style={{ margin: 0 }}>
            <DashboardOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            管理后台
          </Title>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="今日访客"
                value={visitorStats.today}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="本周访客"
                value={visitorStats.thisWeek}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待审核申请"
                value={pendingUsers.length}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已认证专家"
                value={16}
                prefix={<SafetyCertificateOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          {/* 待审核列表 */}
          <Col xs={24} md={16}>
            <Card title="待审核入驻申请" size="small">
              <Table
                columns={pendingColumns}
                dataSource={pendingUsers.map((u, i) => ({ ...u, key: u.id || `pending-${i}` }))}
                pagination={false}
                size="small"
                scroll={{ x: 600 }}
                locale={{ emptyText: '暂无待审核申请' }}
              />
            </Card>
          </Col>

          {/* 右侧统计 */}
          <Col xs={24} md={8}>
            <Card title="设备分布" size="small" style={{ marginBottom: 16 }}>
              {deviceStats.map((d) => (
                <div key={d.name} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <Text>{d.name}</Text>
                    <Text type="secondary">{d.count} ({d.percent}%)</Text>
                  </div>
                  <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${d.percent}%`, background: '#1677ff', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </Card>

            <Card title="访客地区 TOP" size="small">
              {regionStats.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <Text>
                    {i < 3 ? <Tag color={i === 0 ? 'gold' : i === 1 ? 'silver' : 'orange'} style={{ marginRight: 6 }}>{i + 1}</Tag> : <span style={{ width: 24, display: 'inline-block', textAlign: 'center', marginRight: 6 }}>{i + 1}</span>}
                    {r.name}
                  </Text>
                  <Text type="secondary">{r.count}人</Text>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
