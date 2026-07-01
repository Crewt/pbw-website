// Minimal stroke icons (currentColor) for the admin actions.
interface IconProps {
  className?: string;
}
const BASE = "h-4 w-4";
const common = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconEye({ className = BASE }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEdit({ className = BASE }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconTrash({ className = BASE }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function IconUp({ className = BASE }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function IconDown({ className = BASE }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
