import { useState } from 'react';
import { Input, Button, Space, Modal, Select, Cascader } from 'antd';
import { SearchOutlined, UserAddOutlined, AimOutlined } from '@ant-design/icons';
import PushpinIcon from './PushpinIcon';

// 简化的省市区数据
const locationData = [
  {
    value: '北京', label: '北京',
    children: [{ value: '北京', label: '北京', children: [{ value: '东城区', label: '东城区' }, { value: '西城区', label: '西城区' }, { value: '朝阳区', label: '朝阳区' }, { value: '海淀区', label: '海淀区' }] }],
  },
  {
    value: '上海', label: '上海',
    children: [{ value: '上海', label: '上海', children: [{ value: '黄浦区', label: '黄浦区' }, { value: '浦东新区', label: '浦东新区' }] }],
  },
  {
    value: '山东', label: '山东',
    children: [
      { value: '济南', label: '济南', children: [{ value: '历下区', label: '历下区' }, { value: '市中区', label: '市中区' }] },
      { value: '济宁', label: '济宁', children: [{ value: '汶上县', label: '汶上县' }, { value: '曲阜市', label: '曲阜市' }] },
      { value: '青岛', label: '青岛', children: [{ value: '市南区', label: '市南区' }] },
    ],
  },
  {
    value: '广东', label: '广东',
    children: [{ value: '广州', label: '广州', children: [{ value: '天河区', label: '天河区' }] }, { value: '深圳', label: '深圳', children: [{ value: '南山区', label: '南山区' }] }],
  },
  {
    value: '浙江', label: '浙江',
    children: [{ value: '杭州', label: '杭州', children: [{ value: '西湖区', label: '西湖区' }] }],
  },
  {
    value: '江苏', label: '江苏',
    children: [{ value: '南京', label: '南京', children: [{ value: '玄武区', label: '玄武区' }] }, { value: '扬州', label: '扬州', children: [{ value: '广陵区', label: '广陵区' }] }],
  },
  {
    value: '湖北', label: '湖北',
    children: [{ value: '武汉', label: '武汉', children: [{ value: '武昌区', label: '武昌区' }] }],
  },
  {
    value: '四川', label: '四川',
    children: [{ value: '成都', label: '成都', children: [{ value: '锦江区', label: '锦江区' }] }],
  },
  {
    value: '新疆', label: '新疆',
    children: [{ value: '乌鲁木齐', label: '乌鲁木齐', children: [{ value: '天山区', label: '天山区' }] }, { value: '和田', label: '和田', children: [{ value: '和田市', label: '和田市' }] }],
  },
  {
    value: '贵州', label: '贵州',
    children: [{ value: '贵阳', label: '贵阳', children: [{ value: '南明区', label: '南明区' }] }],
  },
  {
    value: '广西', label: '广西',
    children: [{ value: '南宁', label: '南宁', children: [{ value: '青秀区', label: '青秀区' }] }],
  },
  {
    value: '甘肃', label: '甘肃',
    children: [{ value: '兰州', label: '兰州', children: [{ value: '城关区', label: '城关区' }] }],
  },
  {
    value: '江西', label: '江西',
    children: [{ value: '景德镇', label: '景德镇', children: [{ value: '珠山区', label: '珠山区' }] }],
  },
  {
    value: '云南', label: '云南',
    children: [{ value: '昆明', label: '昆明', children: [{ value: '五华区', label: '五华区' }] }],
  },
  {
    value: '海南', label: '海南',
    children: [{ value: '海口', label: '海口', children: [{ value: '龙华区', label: '龙华区' }] }],
  },
];

const distanceData = [
  { label: '5公里', value: 5 },
  { label: '10公里', value: 10 },
  { label: '50公里', value: 50 },
  { label: '100公里', value: 100 },
  { label: '500公里', value: 500 },
  { label: '全国', value: 99999 },
];

interface NavbarProps {
  onSearch: (keyword: string) => void;
  onLocationSelect?: (location: string) => void;
  onDistanceSelect?: (distance: number) => void;
  onGoRegister?: () => void;
}

export default function Navbar({ onSearch, onLocationSelect, onDistanceSelect, onGoRegister }: NavbarProps) {
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLocation, setDialogLocation] = useState<string[]>([]);
  const [dialogKeyword, setDialogKeyword] = useState('');
  const [dialogDistance, setDialogDistance] = useState(99999);

  const handleSearchClick = () => {
    setDialogOpen(true);
    setDialogKeyword(keyword);
  };

  const handleDialogConfirm = () => {
    setKeyword(dialogKeyword);
    onSearch(dialogKeyword);
    if (onLocationSelect && dialogLocation.length > 0) {
      onLocationSelect(dialogLocation.join(' '));
    }
    if (onDistanceSelect) {
      onDistanceSelect(dialogDistance);
    }
    setDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearchClick();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <PushpinIcon size={32} color="#1677ff" className="logo-icon" />
          <span className="logo-text logo-drive-in">搜索在线</span>
          <span className="logo-slogan">搜索在线，你手上的大型人才库。</span>
        </div>
        <div className="navbar-search">
          <Input
            size="large"
            placeholder="你喜欢什么搜一下？"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            onClick={handleSearchClick}
            style={{ width: 400, borderRadius: 8, cursor: 'pointer' }}
            allowClear
            readOnly
          />
          <Button type="primary" size="large" onClick={handleSearchClick} style={{ marginLeft: 8, borderRadius: 8 }}>
            搜索
          </Button>
        </div>
        <div className="navbar-actions">
          <Space>
            <Button type="primary" icon={<UserAddOutlined />} shape="round" onClick={onGoRegister}>注册/登录</Button>
          </Space>
        </div>
      </nav>

      <Modal
        title={<span><AimOutlined style={{ color: '#1677ff', marginRight: 8 }} />搜索设置</span>}
        open={dialogOpen}
        onOk={handleDialogConfirm}
        onCancel={() => setDialogOpen(false)}
        okText="开始搜索"
        cancelText="取消"
        width={480}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>我的位置</div>
            <Cascader
              options={locationData}
              value={dialogLocation}
              onChange={(val) => setDialogLocation(val as string[])}
              placeholder="选择省 / 市 / 县"
              style={{ width: '100%' }}
              allowClear
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>我的关键词</div>
            <Input
              placeholder="如：英语、渐冻症、古琴修复..."
              value={dialogKeyword}
              onChange={(e) => setDialogKeyword(e.target.value)}
              allowClear
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              提示：英语也有门槛，PETS5以下或CET-6以下不被收录信息库，雅思托福可以等
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>距离</div>
            <Select
              value={dialogDistance}
              onChange={setDialogDistance}
              style={{ width: '100%' }}
              options={distanceData}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
