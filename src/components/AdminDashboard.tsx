import { useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Input, Divider } from 'antd';
import { pinyin } from 'pinyin-pro';
import {
  DashboardOutlined, UserAddOutlined, EyeOutlined,
  SafetyCertificateOutlined, TagsOutlined,
  CheckOutlined, CloseOutlined, PlusOutlined, DeleteOutlined,
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
  const [keywords, setKeywords] = useState<string[]>([
    '渐冻症', '运动神经元病', '罕见神经疾病', '法洛四联症', '先天性心脏畸形', '大动脉转位',
    '陶瓷修复', '古瓷鉴损', '锔瓷', '苗药浴', '瑶医火功', '民族医药', '陨石鉴定', '矿石分析',
    '地质勘探', '果树嫁接', '柑橘黄龙病', '果树急救', '维语翻译', '古丝绸之路文献', '中亚语言',
    '冰川潜水', '洞穴探险救援', '深水打捞', '古琴修复', '斫琴', '丝弦制作', '冰川退缩研究',
    '冻土工程', '极地科考', '假肢矫形', '仿生义肢', '步态分析', '尼曼匹克病', '戈谢病',
    '溶酶体贮积症', '船舶堵漏', '水下焊接', '沉船打捞', '壮锦织造', '侗族大歌', '非遗手工艺',
    '高压线带电作业', '特高压检修', '电力抢险', '皮影戏', '景泰蓝', '苏绣', '漆器', '剪纸', '泥塑', '木雕',
    '银饰锻造', '扎染', '蜡染', '油纸伞', '竹编', '土陶',
  ]);
  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  // 按拼音首字母分组排序
  const groupedKeywords = useMemo(() => {
    const groups: Record<string, string[]> = {};
    keywords.forEach((kw) => {
      // 获取拼音首字母（大写）
      const py = pinyin(kw.charAt(0), { pattern: 'first', toneType: 'none' }).toUpperCase();
      const letter = /^[A-Z]$/.test(py) ? py : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(kw);
    });
    // 按字母顺序排序，# 放最后
    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
      })
      .map(([letter, kws]) => ({ letter, keywords: kws.sort((a, b) => a.localeCompare(b, 'zh-CN')) }));
  }, [keywords]);
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

        {/* 关键词管理 */}
        <Card title={<><TagsOutlined style={{ color: '#1677ff', marginRight: 8 }} />关键词管理 <Tag color="blue">{keywords.length}</Tag></>} size="small" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <Input
              placeholder="输入新关键词"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onPressEnter={addKeyword}
              style={{ maxWidth: 300 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addKeyword}>添加</Button>
          </div>
          {groupedKeywords.map((group) => (
            <div key={group.letter} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1677ff', marginBottom: 6 }}>
                {group.letter} <span style={{ color: '#999', fontWeight: 400 }}>({group.keywords.length})</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.keywords.map((kw) => (
                  <Tag
                    key={kw}
                    closable
                    onClose={(e) => { e.preventDefault(); removeKeyword(kw); }}
                    style={{ marginBottom: 2, cursor: 'default' }}
                  >
                    {kw}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </Card>

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
