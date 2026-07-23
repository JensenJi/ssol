import { useState } from 'react';
import { Upload, Button, Input, Divider } from 'antd';
import {
  PlusOutlined, EditOutlined, CameraOutlined, DeleteOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface ResumeSection {
  id: string;
  company: string;
  role: string;
  period: string;
  descriptions: string[];
}

interface ResumeData {
  name: string;
  title: string;
  photo: string;
  address: string;
  phone: string;
  email: string;
  links: { label: string; url: string }[];
  skills: { name: string; level: number }[];
  profile: string;
  experience: ResumeSection[];
  education: { school: string; degree: string; period: string }[];
  sectionTitles: {
    profile: string;
    experience: string;
    education: string;
    details: string;
    links: string;
    skills: string;
  };
}

const defaultResume: ResumeData = {
  name: '点这里填写姓名',
  title: '点这里填写职位/职称',
  photo: '',
  address: '点这里填写地址',
  phone: '点这里填写电话',
  email: '点这里填写邮箱',
  links: [
    { label: 'LinkedIn', url: '' },
    { label: '个人网站', url: '' },
  ],
  skills: [
    { name: '点这里添加技能', level: 80 },
  ],
  sectionTitles: {
    profile: 'Profile 个人简介',
    experience: 'Experience 工作经历',
    education: 'Education 教育背景',
    details: 'Details 联系方式',
    links: 'Links 链接',
    skills: 'Skills 技能',
  },
  profile: '点这里填写个人简介。介绍你的专业背景、核心能力和职业理念...',
  experience: [
    {
      id: '1',
      company: '点这里填写公司名称',
      role: '点这里填写职位',
      period: '2020 - 至今',
      descriptions: ['点这里添加工作描述', '点这里添加工作描述'],
    },
  ],
  education: [
    { school: '点这里填写学校', degree: '点这里填写专业/学位', period: '2016 - 2020' },
  ],
};

export default function ResumeEditor() {
  const [resume, setResume] = useState<ResumeData>(defaultResume);
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateField = (field: keyof ResumeData, value: any) => {
    setResume((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (file: UploadFile) => {
    // 模拟上传 - 实际项目中需要上传到服务器
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField('photo', e.target?.result as string);
    };
    reader.readAsDataURL(file.originFileObj as File);
    return false; // 阻止自动上传
  };

  const addExperience = () => {
    const newExp: ResumeSection = {
      id: Date.now().toString(),
      company: '点这里填写公司名称',
      role: '点这里填写职位',
      period: '2020 - 至今',
      descriptions: ['点这里添加工作描述'],
    };
    updateField('experience', [...resume.experience, newExp]);
  };

  const removeExperience = (id: string) => {
    updateField('experience', resume.experience.filter((e) => e.id !== id));
  };

  const addEducation = () => {
    updateField('education', [
      ...resume.education,
      { school: '点这里填写学校', degree: '点这里填写专业/学位', period: '2020 - 2024' },
    ]);
  };

  const addSkill = () => {
    updateField('skills', [...resume.skills, { name: '新技能', level: 50 }]);
  };

  const removeSkill = (idx: number) => {
    updateField('skills', resume.skills.filter((_, i) => i !== idx));
  };

  const addLink = () => {
    updateField('links', [...resume.links, { label: '新链接', url: '' }]);
  };

  const removeLink = (idx: number) => {
    updateField('links', resume.links.filter((_, i) => i !== idx));
  };

  return (
    <div className="resume-editor">
      {/* 顶部：照片 + 姓名 + 职位 */}
      <div className="resume-header">
        <div className="resume-photo-section">
          {resume.photo ? (
            <img src={resume.photo} alt="头像" className="resume-photo" />
          ) : (
            <div className="resume-photo-placeholder">
              <CameraOutlined style={{ fontSize: 32, color: '#bbb' }} />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>点这里插入照片</div>
            </div>
          )}
          <Upload
            showUploadList={false}
            beforeUpload={handlePhotoUpload}
            accept="image/*"
          >
            <Button size="small" icon={<EditOutlined />} style={{ marginTop: 8 }}>
              更换照片
            </Button>
          </Upload>
        </div>
        <div className="resume-name-section">
          <Input
            value={resume.name}
            onChange={(e) => updateField('name', e.target.value)}
            onFocus={() => setEditingField('name')}
            onBlur={() => setEditingField(null)}
            className={`resume-input ${editingField === 'name' ? 'editing' : ''}`}
            style={{ fontSize: 24, fontWeight: 700, border: 'none', padding: 0 }}
            placeholder="点这里填写姓名"
          />
          <Input
            value={resume.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="resume-input"
            style={{ fontSize: 14, color: '#666', border: 'none', padding: 0 }}
            placeholder="点这里填写职位/职称"
          />
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 两栏布局：左侧主要内容 + 右侧详情 */}
      <div className="resume-body">
        {/* 左侧 */}
        <div className="resume-main">
          {/* 个人简介 */}
          <section className="resume-section">
            <Input
              value={resume.sectionTitles.profile}
              onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, profile: e.target.value } }))}
              className="resume-section-title-input"
              style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, padding: '2px 6px' }}
            />
            <Input.TextArea
              value={resume.profile}
              onChange={(e) => updateField('profile', e.target.value)}
              rows={4}
              className="resume-textarea"
              placeholder="点这里填写个人简介..."
            />
          </section>

          {/* 工作经历 */}
          <section className="resume-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                value={resume.sectionTitles.experience}
                onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, experience: e.target.value } }))}
                className="resume-section-title-input"
                style={{ fontSize: 14, fontWeight: 600, padding: '2px 6px' }}
              />
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addExperience}>
                添加经历
              </Button>
            </div>
            {resume.experience.map((exp) => (
              <div key={exp.id} className="resume-experience-item">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Input
                    value={exp.company}
                    onChange={(e) => {
                      const updated = resume.experience.map((item) =>
                        item.id === exp.id ? { ...item, company: e.target.value } : item
                      );
                      updateField('experience', updated);
                    }}
                    className="resume-input"
                    style={{ fontWeight: 600, fontSize: 15 }}
                    placeholder="点这里填写公司名称"
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    onClick={() => removeExperience(exp.id)}
                    style={{ fontSize: 12 }}
                  >
                    删除
                  </Button>
                </div>
                <Input
                  value={exp.role}
                  onChange={(e) => {
                    const updated = resume.experience.map((item) =>
                      item.id === exp.id ? { ...item, role: e.target.value } : item
                    );
                    updateField('experience', updated);
                  }}
                  className="resume-input"
                  style={{ fontSize: 13, color: '#333' }}
                  placeholder="点这里填写职位"
                />
                <Input
                  value={exp.period}
                  onChange={(e) => {
                    const updated = resume.experience.map((item) =>
                      item.id === exp.id ? { ...item, period: e.target.value } : item
                    );
                    updateField('experience', updated);
                  }}
                  className="resume-input"
                  style={{ fontSize: 12, color: '#999' }}
                  placeholder="点这里更改时间"
                />
                {exp.descriptions.map((desc, idx) => (
                  <Input
                    key={idx}
                    value={desc}
                    onChange={(e) => {
                      const updated = resume.experience.map((item) =>
                        item.id === exp.id
                          ? {
                              ...item,
                              descriptions: item.descriptions.map((d, i) =>
                                i === idx ? e.target.value : d
                              ),
                            }
                          : item
                      );
                      updateField('experience', updated);
                    }}
                    className="resume-input"
                    style={{ fontSize: 13, paddingLeft: 16 }}
                    prefix={<span style={{ color: '#999' }}>•</span>}
                    placeholder="点这里添加工作描述"
                  />
                ))}
              </div>
            ))}
          </section>

          {/* 教育背景 */}
          <section className="resume-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                value={resume.sectionTitles.education}
                onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, education: e.target.value } }))}
                className="resume-section-title-input"
                style={{ fontSize: 14, fontWeight: 600, padding: '2px 6px' }}
              />
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addEducation}>
                添加教育
              </Button>
            </div>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="resume-experience-item">
                <Input
                  value={edu.school}
                  onChange={(e) => {
                    const updated = resume.education.map((item, i) =>
                      i === idx ? { ...item, school: e.target.value } : item
                    );
                    updateField('education', updated);
                  }}
                  className="resume-input"
                  style={{ fontWeight: 600, fontSize: 15 }}
                  placeholder="点这里填写学校"
                />
                <Input
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = resume.education.map((item, i) =>
                      i === idx ? { ...item, degree: e.target.value } : item
                    );
                    updateField('education', updated);
                  }}
                  className="resume-input"
                  style={{ fontSize: 13 }}
                  placeholder="点这里填写专业/学位"
                />
                <Input
                  value={edu.period}
                  onChange={(e) => {
                    const updated = resume.education.map((item, i) =>
                      i === idx ? { ...item, period: e.target.value } : item
                    );
                    updateField('education', updated);
                  }}
                  className="resume-input"
                  style={{ fontSize: 12, color: '#999' }}
                  placeholder="点这里更改时间"
                />
              </div>
            ))}
          </section>
        </div>

        {/* 右侧 */}
        <div className="resume-sidebar">
          {/* 联系方式 */}
          <section className="resume-section">
            <Input
              value={resume.sectionTitles.details}
              onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, details: e.target.value } }))}
              className="resume-section-title-input"
              style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, padding: '2px 6px' }}
            />
            <div className="resume-detail-item">
              <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 8 }} />
              <Input
                value={resume.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="resume-input"
                placeholder="点这里填写地址"
              />
            </div>
            <div className="resume-detail-item">
              <PhoneOutlined style={{ color: '#1677ff', marginRight: 8 }} />
              <Input
                value={resume.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="resume-input"
                placeholder="点这里填写电话"
              />
            </div>
            <div className="resume-detail-item">
              <MailOutlined style={{ color: '#1677ff', marginRight: 8 }} />
              <Input
                value={resume.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="resume-input"
                placeholder="点这里填写邮箱"
              />
            </div>
          </section>

          {/* 链接 */}
          <section className="resume-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                value={resume.sectionTitles.links}
                onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, links: e.target.value } }))}
                className="resume-section-title-input"
                style={{ fontSize: 14, fontWeight: 600, padding: '2px 6px' }}
              />
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addLink}>
                添加
              </Button>
            </div>
            {resume.links.map((link, idx) => (
              <div key={idx} className="resume-detail-item">
                <LinkOutlined style={{ color: '#1677ff', marginRight: 8, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Input
                      value={link.label}
                      onChange={(e) => {
                        const updated = resume.links.map((item, i) =>
                          i === idx ? { ...item, label: e.target.value } : item
                        );
                        updateField('links', updated);
                      }}
                      className="resume-input"
                      style={{ fontSize: 12, fontWeight: 600, flex: 1 }}
                      placeholder="链接名称"
                    />
                    <Button
                      size="small"
                      type="text"
                      danger
                      onClick={() => removeLink(idx)}
                      icon={<DeleteOutlined />}
                      style={{ fontSize: 12, flexShrink: 0 }}
                    />
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const updated = resume.links.map((item, i) =>
                        i === idx ? { ...item, url: e.target.value } : item
                      );
                      updateField('links', updated);
                    }}
                    className="resume-input"
                    placeholder="点这里填写链接地址"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* 技能 */}
          <section className="resume-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                value={resume.sectionTitles.skills}
                onChange={(e) => setResume((prev) => ({ ...prev, sectionTitles: { ...prev.sectionTitles, skills: e.target.value } }))}
                className="resume-section-title-input"
                style={{ fontSize: 14, fontWeight: 600, padding: '2px 6px' }}
              />
              <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={addSkill}>
                添加
              </Button>
            </div>
            {resume.skills.map((skill, idx) => (
              <div key={idx} className="resume-skill-item">
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                  <Input
                    value={skill.name}
                    onChange={(e) => {
                      const updated = resume.skills.map((item, i) =>
                        i === idx ? { ...item, name: e.target.value } : item
                      );
                      updateField('skills', updated);
                    }}
                    className="resume-input"
                    style={{ fontSize: 13, flex: 1 }}
                    placeholder="点这里填写技能名称"
                  />
                  <Button
                    size="small"
                    type="text"
                    danger
                    onClick={() => removeSkill(idx)}
                    icon={<DeleteOutlined />}
                    style={{ fontSize: 12, flexShrink: 0 }}
                  />
                </div>
                <div className="resume-skill-bar">
                  <div
                    className="resume-skill-fill"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skill.level}
                  onChange={(e) => {
                    const updated = resume.skills.map((item, i) =>
                      i === idx ? { ...item, level: Number(e.target.value) } : item
                    );
                    updateField('skills', updated);
                  }}
                  style={{ width: '100%', marginTop: 4 }}
                />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
