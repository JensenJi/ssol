import { useState } from 'react';
import { Typography, Divider } from 'antd';

const { Title, Paragraph } = Typography;

interface Article {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  content: string;
  images?: string[];
}

interface ArticleViewProps {
  articles: Article[];
  currentArticleId?: string;
  onBack?: () => void;
}

export default function ArticleView({ articles, currentArticleId, onBack }: ArticleViewProps) {
  const [activeId, setActiveId] = useState(currentArticleId || (articles.length > 0 ? articles[0].id : ''));
  const active = articles.find((a) => a.id === activeId) || articles[0];

  if (!active) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>暂无文章</div>;
  }

  const currentIndex = articles.findIndex((a) => a.id === activeId);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  // 将内容按段落分割，支持图片标记 [img:url]
  const renderContent = (content: string) => {
    const parts = content.split(/\n\n+/);
    return parts.map((part, i) => {
      if (part.startsWith('[img:')) {
        const url = part.replace('[img:', '').replace(']', '');
        return (
          <div key={i} style={{ margin: '24px 0', textAlign: 'center' }}>
            <img src={url} alt="" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 4 }} />
          </div>
        );
      }
      return (
        <Paragraph key={i} style={{ fontSize: 16, lineHeight: 2, textIndent: '2em', marginBottom: 20 }}>
          {part}
        </Paragraph>
      );
    });
  };

  return (
    <div className="article-page">
      {/* 顶部信息栏 */}
      <div className="article-topbar">
        <span className="article-date">{active.date}</span>
        <span className="article-sep">|</span>
        <span className="article-author">{active.author}</span>
        <span className="article-sep">|</span>
        <span className="article-category">{active.category}</span>
        <span className="article-nav-links">
          {prevArticle && (
            <a className="article-nav-link" onClick={() => setActiveId(prevArticle.id)}>
              上一篇
            </a>
          )}
          {nextArticle && (
            <a className="article-nav-link" onClick={() => setActiveId(nextArticle.id)}>
              下一篇
            </a>
          )}
        </span>
      </div>

      {/* 标题 */}
      <Title level={2} className="article-title">
        {active.title}
      </Title>

      <Divider style={{ margin: '16px 0 24px' }} />

      {/* 主体：两栏布局 */}
      <div className="article-body">
        {/* 左侧：文章内容 */}
        <div className="article-main">
          {renderContent(active.content)}
        </div>

        {/* 右侧：侧边栏 */}
        <div className="article-sidebar">
          <div className="sidebar-title">我的文章</div>
          <ul className="sidebar-article-list">
            {articles.map((a) => (
              <li
                key={a.id}
                className={a.id === activeId ? 'sidebar-active' : ''}
                onClick={() => setActiveId(a.id)}
                style={{ cursor: 'pointer' }}
              >
                {a.date}：{a.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
