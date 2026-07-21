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
      viewBox="0 0 48 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 圆头（塑料球） */}
      <circle cx="24" cy="14" r="12" fill={color} />
      {/* 圆头高光 */}
      <circle cx="20" cy="10" r="4" fill="rgba(255,255,255,0.4)" />
      {/* 金属针身 */}
      <rect x="22" y="24" width="4" height="30" rx="2" fill="#b0b0b0" />
      {/* 针身反光 */}
      <rect x="23" y="26" width="1.5" height="26" rx="1" fill="rgba(255,255,255,0.3)" />
      {/* 针尖 */}
      <polygon points="22,54 26,54 24,62" fill="#888" />
    </svg>
  );
}
