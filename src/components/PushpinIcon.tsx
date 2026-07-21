// 真实大头针 SVG 图标（圆头+金属针）
interface PushpinIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PushpinIcon({ size = 28, color = '#1677ff', className, style }: PushpinIconProps) {
  // viewBox 32x48，高宽比 1.5，保持比例
  const height = Math.round(size * 1.5);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 32 48"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 圆头（塑料球） */}
      <circle cx="16" cy="10" r="9" fill={color} />
      {/* 圆头高光 */}
      <circle cx="13" cy="7" r="3" fill="rgba(255,255,255,0.45)" />
      {/* 金属针身（加长） */}
      <rect x="14.5" y="18" width="3" height="22" rx="1.5" fill="#b0b0b0" />
      {/* 针身反光 */}
      <rect x="15.2" y="20" width="1" height="18" rx="0.5" fill="rgba(255,255,255,0.35)" />
      {/* 针尖 */}
      <polygon points="14.5,40 17.5,40 16,46" fill="#888" />
    </svg>
  );
}
