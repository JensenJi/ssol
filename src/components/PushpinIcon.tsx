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
      viewBox="0 0 64 64"
      className={className}
      style={{ transform: 'rotate(45deg)', ...style }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 圆头（塑料/金属球） */}
      <circle cx="32" cy="16" r="14" fill={color} />
      {/* 圆头高光 */}
      <circle cx="28" cy="12" r="5" fill="rgba(255,255,255,0.35)" />
      {/* 金属针身 */}
      <line x1="32" y1="28" x2="32" y2="56" stroke="#b0b0b0" strokeWidth="3" strokeLinecap="round" />
      {/* 针尖 */}
      <line x1="32" y1="54" x2="32" y2="60" stroke="#888" strokeWidth="2" strokeLinecap="round" />
      {/* 针身反光 */}
      <line x1="31" y1="30" x2="31" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    </svg>
  );
}
