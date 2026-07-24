import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Typography } from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const categories = ['疑难杂症', '稀有工种', '非遗手艺', '农业专家', '特殊技能', '翻译语言', '医生', '其它'];

interface RegisterPageProps {
  onBack: () => void;
  onRegister: (user: Partial<Doctor>) => void;
  ipLocation?: { name: string } | null;
}

export default function RegisterPage({ onBack, onRegister, ipLocation }: RegisterPageProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onRegister({
        name: values.nickname,
        realName: values.realName,
        keywords: values.keywords?.split(/[,，、\s]+/).filter(Boolean) || [],
        category: showCustomInput ? customCategory : values.category,
        hospital: isDoctor ? values.workplace : (values.workplace || ''),
        title: values.title || '',
        province: ipLocation?.name?.split(' ')[0] || values.province || '',
        city: ipLocation?.name?.split(' ')[1] || values.city || '',
        bio: values.bio || '',
        contact_phone: values.phone || '',
        verified: false,
        likes: 0,
      } as Partial<Doctor>);
      setSubmitting(false);
      // 成功后跳转到个人中心（由 App.tsx 的 handleRegister 处理）
    } catch (e) {
      setSubmitting(false);
      message.warning('请填写必填项');
    }
  };

  return (
    <div className="register-page" style={{ paddingTop: 80 }}>
      <div className="register-container">
        <Card className="register-card">
          <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
            <UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            用户注册
          </Title>
          <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
            告诉我们你的专业和特长，是金子都会发光的。
          </Paragraph>

          <Form form={form} layout="vertical" size="large">
            {/* 必填项区域 */}
            <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
              <Text strong style={{ color: '#52c41a', fontSize: 13 }}>以下带 * 为必填项</Text>
            </div>

            <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称（展示用名）' }]}>
              <Input prefix={<UserOutlined />} placeholder="你的展示名称，不需要真实姓名" />
            </Form.Item>

            <Form.Item name="realName" label="真实姓名" tooltip="仅用于身份验证，不会公开展示">
              <Input prefix={<UserOutlined />} placeholder="真实姓名（仅用于身份验证，不公开）" />
            </Form.Item>

            <Form.Item name="phone" label="手机号码" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="选填" maxLength={11} />
            </Form.Item>

            <Form.Item name="email" label="电子邮箱">
              <Input prefix={<MailOutlined />} placeholder="选填" />
            </Form.Item>

            {/* IP定位位置 */}
            <Form.Item label="所在地区">
              {ipLocation ? (
                <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', fontSize: 14 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                  {ipLocation.name}
                  <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>（IP自动定位）</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Form.Item name="province" noStyle>
                    <Input placeholder="省" style={{ flex: 1 }} />
                  </Form.Item>
                  <Form.Item name="city" noStyle>
                    <Input placeholder="市" style={{ flex: 1 }} />
                  </Form.Item>
                </div>
              )}
            </Form.Item>

            <Form.Item name="category" label="专业分类" rules={[{ required: true, message: '请选择分类' }]}>
              <Select
                placeholder="请选择您的专业领域"
                onChange={(val) => {
                  setIsDoctor(val === '医生');
                  setShowCustomInput(val === '其它');
                }}
              >
                {categories.map((c) => <Option key={c} value={c}>{c}</Option>)}
              </Select>
            </Form.Item>
            {showCustomInput && (
              <Form.Item
                name="customCategory"
                rules={[{ required: true, message: '请输入自定义分类' }]}
                style={{ marginTop: -16, marginBottom: 16 }}
              >
                <Input
                  placeholder="请输入您的专业分类"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </Form.Item>
            )}

            <Form.Item name="keywords" label="我的关键词" rules={[{ required: true, message: '请输入关键词' }]}>
              <Input placeholder="用空格或顿号分隔，如：渐冻症 罕见病 神经疾病" />
            </Form.Item>
            <div style={{ fontSize: 12, color: '#fa8c16', marginBottom: 16, padding: '8px 12px', background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
               提示：关键词是你的核心标签，别人通过关键词找到你。
            </div>

            <Form.Item name="title" label="职称/头衔">
              <Input placeholder="选填，如：主任医师、高级技师、传承人..." />
            </Form.Item>

            <Form.Item
              name="workplace"
              label="工作单位"
              rules={isDoctor ? [{ required: true, message: '医生必须填写工作单位' }] : []}
            >
              <Input placeholder={isDoctor ? '医生必填：请输入工作单位' : '选填：请输入工作单位'} />
            </Form.Item>

            <Form.Item name="bio" label="自我介绍/能提供的服务">
              <Input.TextArea rows={3} placeholder="选填：请描述您能为大家提供什么专业服务..." />
            </Form.Item>

            <Button type="primary" onClick={handleSubmit} loading={submitting} size="large" block style={{ marginTop: 8 }}>
              提交申请
            </Button>

            <Paragraph type="secondary" style={{ fontSize: 12, textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
              根据《网络安全法》和《个人信息保护法》，您的信息将被严格保密，仅用于平台审核和展示。
            </Paragraph>
          </Form>
        </Card>
      </div>
    </div>
  );
}
