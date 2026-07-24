import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';

interface FooterProps {
  onGoHome?: () => void;
  onGoPersonal?: () => void;
}

export default function Footer({ onGoHome, onGoPersonal }: FooterProps) {
  const navLinks = [
    { label: '首页', action: onGoHome },
    { label: '全国数据', action: undefined },
    { label: '当前新增', action: undefined },
    { label: '历史数据', action: undefined },
    { label: '信息发布', action: undefined },
    { label: '我的信息', action: onGoPersonal },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* 左侧：品牌信息 */}
        <div className="footer-section footer-brand">
          <div style={{ marginBottom: 12 }}>
            <span className="footer-highlight">我要找到你</span>
            <span className="footer-red" style={{ marginLeft: 12, fontSize: 18, fontWeight: 700 }}>搜索在线</span>
          </div>
          <div style={{ marginBottom: 8, fontSize: 13 }}>
            <span className="footer-highlight" style={{ fontSize: 12, padding: '2px 6px', marginRight: 8 }}>www.wyzdn.com</span>
            <span className="footer-red" style={{ fontSize: 16 }}>https://ssol.cn</span>
          </div>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            我们帮助重逢，连接牵挂，找回故人，重拾情谊，让思念落地。
          </div>
          <div style={{ fontSize: 13 }}>
            <span className="footer-highlight" style={{ padding: '2px 6px', marginRight: 8 }}>心有所念，终能相见。</span>
            <span className="footer-red" style={{ fontSize: 15 }}>你在想什么？搜索一下！</span>
          </div>
        </div>

        {/* 中间：导航链接 */}
        <div className="footer-section footer-nav">
          <div className="footer-section-title">导航链接</div>
          <ul className="footer-nav-list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.action ? undefined : '#'}
                  onClick={(e) => {
                    if (link.action) {
                      e.preventDefault();
                      link.action();
                    }
                  }}
                  className="footer-link"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="footer-copyright">
            <span className="footer-red" style={{ fontSize: 15, fontWeight: 600 }}>搜索在线版权所有</span>
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            <span className="footer-highlight" style={{ padding: '1px 4px' }}>© 2026 我要找到你 版权所有</span>
          </div>
        </div>

        {/* 右侧：联系我们 */}
        <div className="footer-section footer-contact">
          <div className="footer-section-title">联系我们</div>
          <div className="footer-contact-item">
            <PhoneOutlined style={{ color: '#999', marginRight: 8 }} />
            <span>19206261356</span>
          </div>
          <div className="footer-contact-item">
            <MailOutlined style={{ color: '#999', marginRight: 8 }} />
            <span>admin@wyzdn.com</span>
          </div>
          <div className="footer-contact-item">
            <EnvironmentOutlined style={{ color: '#999', marginRight: 8 }} />
            <span>山东济宁</span>
          </div>

          <div className="footer-section-title" style={{ marginTop: 20 }}>友情链接</div>
          <div style={{ marginBottom: 4 }}>
            <span className="footer-highlight" style={{ fontSize: 12, padding: '1px 4px' }}>www.jensenji.com</span>
          </div>
          <div>
            <span className="footer-red" style={{ fontSize: 16, fontWeight: 600 }}>www.wyzdn.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
