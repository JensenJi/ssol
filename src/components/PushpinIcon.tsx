// 真实大头针 SVG 图标（圆头+金属针）
interface PushpinIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PushpinIcon({ size = 28, color = '#e53935', className, style }: PushpinIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 圆头（塑料球） */}
      <circle cx="20" cy="10" r="8" fill={color} />
      {/* 圆头高光 */}
      <circle cx="17" cy="7" r="2.5" fill="rgba(255,255,255,0.45)" />
      {/* 金属针身（加长） */}
      <rect x="18.5" y="17" width="3" height="16" rx="1.5" fill="#b0b0b0" />
      {/* 针身反光 */}
      <rect x="19.2" y="19" width="1" height="12" rx="0.5" fill="rgba(255,255,255,0.35)" />
      {/* 针尖 */}
      <polygon points="18.5,33 21.5,33 20,38" fill="#888" />
    </svg>
  );
}
