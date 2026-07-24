import { PhoneOutlined, MailOutlined } from '@ant-design/icons';

interface FooterProps {
  onGoHome?: () => void;
  onGoRegister?: () => void;
}

export default function Footer({ onGoHome, onGoRegister }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* 左：品牌 */}
        <div className="footer-col">
          <div className="footer-brand-name">搜索在线</div>
          <div className="footer-url">https://ssol.cn</div>
          <div className="footer-slogan">你想到的，搜一下！</div>
        </div>

        {/* 中：导航 */}
        <div className="footer-col">
          <a className="footer-nav-link" onClick={onGoHome} style={{ cursor: 'pointer' }}>首页</a>
          <a className="footer-nav-link" onClick={onGoRegister} style={{ cursor: 'pointer' }}>注册</a>
        </div>

        {/* 右：联系 + 友链 */}
        <div className="footer-col">
          <div className="footer-contact-row">
            <PhoneOutlined style={{ fontSize: 12, marginRight: 4 }} /> 19206261356
          </div>
          <div className="footer-contact-row">
            <MailOutlined style={{ fontSize: 12, marginRight: 4 }} /> admin@ssol.cn
          </div>
          <div className="footer-friend-links">
            <span style={{ color: '#999', fontSize: 12 }}>友情链接：</span>
            <a href="https://jensenji.cn" target="_blank" rel="noopener noreferrer" className="footer-friend-link">jensenji.cn</a>
            <a href="https://wyzdn.com" target="_blank" rel="noopener noreferrer" className="footer-friend-link">wyzdn.com</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 搜索在线 版权所有
      </div>
    </footer>
  );
}
