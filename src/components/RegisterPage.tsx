import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Typography, Divider, Steps } from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined,
  ArrowLeftOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { Doctor } from '../data/mockData';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface RegisterPageProps {
  onBack: () => void;
  onRegister: (user: Partial<Doctor>) => void;
}

// 身份证验证（18位）
function validateIdCard(id: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(id)) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(id[i]) * weights[i];
  }
  return checkCodes[sum % 11] === id[17].toUpperCase();
}

// 从身份证提取信息
function extractIdInfo(id: string) {
  const year = parseInt(id.substring(6, 10));
  const month = parseInt(id.substring(10, 12));
  const day = parseInt(id.substring(12, 14));
  const gender = parseInt(id[16]) % 2 === 1 ? '男' : '女';
  // 简单地区映射
  const provinceMap: Record<string, string> = {
    '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古',
    '21': '辽宁', '22': '吉林', '23': '黑龙江', '31': '上海', '32': '江苏',
    '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东',
    '41': '河南', '42': '湖北', '43': '湖南', '44': '广东', '45': '广西',
    '46': '海南', '50': '重庆', '51': '四川', '52': '贵州', '53': '云南',
    '54': '西藏', '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏',
    '65': '新疆',
  };
  const province = provinceMap[id.substring(0, 2)] || '未知';
  return { year, month, day, gender, province, age: new Date().getFullYear() - year };
}

const categories = ['疑难杂症', '稀有工种', '非遗手艺', '农业专家', '特殊技能', '翻译语言'];

export default function RegisterPage({ onBack, onRegister }: RegisterPageProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [idInfo, setIdInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleIdChange = (value: string) => {
    if (value.length === 18) {
      if (validateIdCard(value)) {
        const info = extractIdInfo(value);
        setIdInfo(info);
        form.setFieldsValue({
          gender: info.gender,
          province: info.province,
          age: info.age,
        });
      } else {
        setIdInfo(null);
        form.setFieldsValue({ gender: undefined, province: undefined, age: undefined });
      }
    } else {
      setIdInfo(null);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (e) {
      message.warning('请填写完整信息');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const values = form.getFieldsValue();
    onRegister({
      name: values.name,
      keywords: values.keywords?.split('、') || [],
      category: values.category,
      hospital: values.workplace,
      title: values.title,
      province: values.province,
      city: values.city,
      bio: values.bio,
      contact_phone: values.phone,
      verified: false, // 需要管理员审核
      likes: 0,
    } as Partial<Doctor>);
    setSubmitting(false);
    setCurrentStep(3);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={onBack} className="back-btn">
          返回首页
        </Button>

        <Card className="register-card">
          <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
            <UserOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            专家入驻申请
          </Title>
          <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 24 }}>
            人人都是专家，人人服务大家。请填写真实信息，审核通过后即可入驻信息库。
          </Paragraph>

          <Steps
            current={currentStep}
            style={{ marginBottom: 32 }}
            items={[
              { title: '身份信息' },
              { title: '专业信息' },
              { title: '确认提交' },
              { title: '完成' },
            ]}
          />

          {currentStep === 0 && (
            <Form form={form} layout="vertical" size="large">
              <Form.Item name="name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
                <Input prefix={<UserOutlined />} placeholder="请输入您的真实姓名" />
              </Form.Item>

              <Form.Item
                name="idCard"
                label="身份证号"
                rules={[
                  { required: true, message: '请输入身份证号' },
                  { validator: (_, value) => value && value.length === 18 && validateIdCard(value) ? Promise.resolve() : Promise.reject(new Error('身份证号格式不正确')) }
                ]}
              >
                <Input
                  prefix={<IdcardOutlined />}
                  placeholder="18位身份证号码"
                  maxLength={18}
                  onChange={(e) => handleIdChange(e.target.value)}
                />
              </Form.Item>

              {idInfo && (
                <div className="id-info-box">
                  <Text type="success"><CheckCircleOutlined /> 身份证验证通过</Text>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
                    性别：{idInfo.gender} | 年龄：{idInfo.age}岁 | 籍贯：{idInfo.province}
                  </div>
                </div>
              )}

              <Form.Item name="phone" label="手机号码" rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" maxLength={11} />
              </Form.Item>

              <Form.Item name="email" label="电子邮箱">
                <Input prefix={<MailOutlined />} placeholder="选填" />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={handleNext}>下一步</Button>
              </div>
            </Form>
          )}

          {currentStep === 1 && (
            <Form form={form} layout="vertical" size="large">
              <Form.Item name="category" label="专业分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder="请选择您的专业领域">
                  {categories.map((c) => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>

              <Form.Item name="title" label="职称/头衔" rules={[{ required: true, message: '请输入职称' }]}>
                <Input placeholder="如：主任医师、高级技师、传承人..." />
              </Form.Item>

              <Form.Item name="workplace" label="工作单位" rules={[{ required: true, message: '请输入工作单位' }]}>
                <Input placeholder="请输入您的工作单位" />
              </Form.Item>

              <Form.Item name="city" label="所在城市" rules={[{ required: true, message: '请输入城市' }]}>
                <Input placeholder="如：北京、上海、济南..." />
              </Form.Item>

              <Form.Item name="keywords" label="专业关键词" rules={[{ required: true, message: '请输入关键词' }]}>
                <Input placeholder="用、分隔，如：渐冻症、罕见病、神经疾病" />
              </Form.Item>

              <Form.Item name="bio" label="自我介绍/能提供的服务" rules={[{ required: true, message: '请简要介绍您的专业服务' }]}>
                <Input.TextArea rows={4} placeholder="请描述您能为大家提供什么专业服务..." />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                <Button type="primary" onClick={handleNext}>下一步</Button>
              </div>
            </Form>
          )}

          {currentStep === 2 && (
            <div className="confirm-section">
              <Title level={5}>请确认以下信息</Title>
              <div className="confirm-info">
                {Object.entries(form.getFieldsValue()).map(([key, value]) => (
                  value && key !== 'idCard' ? (
                    <div key={key} className="confirm-row">
                      <Text type="secondary">{key}：</Text>
                      <Text strong>{String(value)}</Text>
                    </div>
                  ) : null
                ))}
              </div>
              <Divider />
              <Paragraph type="secondary" style={{ fontSize: 12 }}>
                根据《中华人民共和国网络安全法》和《个人信息保护法》，您的信息将被严格保密，仅用于平台审核和展示。
                提交后需等待管理员审核，审核通过后即可入驻信息库。
              </Paragraph>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCurrentStep(1)}>上一步</Button>
                <Button type="primary" onClick={handleSubmit} loading={submitting} size="large">
                  提交申请
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="success-section">
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              <Title level={4} style={{ marginTop: 16 }}>申请已提交</Title>
              <Paragraph type="secondary">
                您的入驻申请已提交成功，管理员将在1-3个工作日内完成审核。
                <br />审核结果将通过短信通知您。
              </Paragraph>
              <Button type="primary" onClick={onBack}>返回首页</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
