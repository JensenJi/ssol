// 真实大头针 SVG 图标（圆头+金属针）
interface PushpinIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PushpinIcon({ size = 28, color = '#1677ff', className, style }: PushpinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 圆头（塑料球） */}
      <circle cx="24" cy="14" r="10" fill={color} />
      {/* 圆头高光 */}
      <circle cx="20" cy="10" r="3.5" fill="rgba(255,255,255,0.45)" />
      {/* 金属针身 */}
      <rect x="22" y="22" width="4" height="18" rx="2" fill="#b0b0b0" />
      {/* 针身反光 */}
      <rect x="22.8" y="24" width="1.2" height="14" rx="0.6" fill="rgba(255,255,255,0.35)" />
      {/* 针尖 */}
      <polygon points="22,40 26,40 24,46" fill="#888" />
    </svg>
  );
}
